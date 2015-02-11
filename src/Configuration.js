module.exports = Configuration;

var Flags = {
  enableHD: 1,
  enableCallControl: 2,
  enableCallTimer: 4,
  enableCallHistory: 8,
  enableFullScreen: 16,
  enableSelfView: 32,
  enableCallStats: 64,
  enableDialpad: 128,
  enableMute: 256,
  enableMessages: 512,
  enableRegistrationIcon: 1024,
  enableConnectionIcon: 2048,
  enableWindowDrag: 4096,
  enableSettings: 8192,
  enableAutoAnswer: 16384,
  enableAutoAcceptReInvite: 32768,
  enableConnectLocalMedia: 65536,
  enableTransfer: 131072,
  enableHold: 262144,
  enableIms: 524288
};

Configuration.Flags = Flags;

var events = require('./eventbus');
var debug = function(msg){ require('./debug')('configuration')(msg); }
var Utils = require('./Utils');
var WebRTC_C = require('./Constants');
var ExSIP = require('exsip');

function Configuration(configObj) {
  debug('window.location.search : ' + window.location.search);
  debug('configuration options : ' + ExSIP.Utils.toString(configObj));
  jQuery.extend(this, configObj);

  // Default URL variables
  if (Utils.getSearchVariable("disableMessages")) {
    this.enableMessages = false;
  }
  this.destination = this.destination || Utils.getSearchVariable("destination");
  this.networkUserId = this.networkUserId || Utils.getSearchVariable("networkUserId");
  this.hd = (Utils.getSearchVariable("hd") === "true") || $.cookie('settingHD');
  this.audioOnly = (Utils.getSearchVariable("audioOnly") === "true");
  this.sipDisplayName = this.displayName || Utils.getSearchVariable("name") || $.cookie('settingDisplayName');
  if (this.sipDisplayName) {
    this.sipDisplayName = this.sipDisplayName.replace(/%20/g, " ");
  }
  this.maxCallLength = Utils.getSearchVariable("maxCallLength");
  this.size = Utils.getSearchVariable("size") || $.cookie('settingSize') || 1;
  this.color = Utils.colorNameToHex(Utils.getSearchVariable("color")) || $.cookie('settingColor');
  this.offerToReceiveVideo = true;
  var features = Utils.getSearchVariable("features");
  if (features) {
    this.setClientConfigFlags(parseInt(features, 10));
  }
  this.bodyBackgroundColor = $('body').css('backgroundColor');
}

Configuration.prototype = {
  getClientConfigFlags: function() {
    var flags = 0;
    for (var flag in Flags) {
      var value = Flags[flag];
      if (this[flag]) {
        flags |= value;
      }
    }
    return flags;
  },
  setClientConfigFlags: function(flags) {
    for (var flag in Flags) {
      var value = Flags[flag];
      if (flags & value) {
        this[flag] = true;
      } else {
        this[flag] = false;
      }
    }
  },
  isAudioOnlyView: function() {
    var views = this.getViews();
    return views.indexOf('audioOnly') !== -1;
  },
  getViews: function() {
    var view = Utils.getSearchVariable("view");
    var views = [];
    if (this.view) {
      $.merge(views, this.view.split(' '));
    }
    if (view) {
      $.merge(views, view.split(' '));
    }
    return $.unique(views);
  },
  getBackgroundColor: function() {
    return this.color || this.bodyBackgroundColor;
  },
  getPassword: function() {
    return $.cookie('settingPassword');
  },
  isAutoAnswer: function() {
    return this.settings.settingAutoAnswer.is(':checked');
  },
  getDTMFOptions: function() {
    return {
      duration: WebRTC_C.DEFAULT_DURATION,
      interToneGap: WebRTC_C.DEFAULT_INTER_TONE_GAP
    };
  },
  getExSIPOptions: function() {
    // Options Passed to ExSIP
    var options = {
      mediaConstraints: {
        audio: true,
        video: this.getVideoConstraints()
      },
      createOfferConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: !this.isAudioOnlyView() && this.offerToReceiveVideo
        }
      }
    };
    return options;
  },

  getMediaConstraints: function() {
    if (this.client.isScreenSharing) {
      return {
        video: {
          mandatory: {
            chromeMediaSource: 'screen'
          }
        }
      };
    } else {
      return {
        audio: true,
        video: this.getVideoConstraints()
      };
    }
  },

  getVideoConstraints: function() {
    if (this.isAudioOnlyView() || this.audioOnly) {
      return false;
    } else {
      var constraints = this.getResolutionConstraints();
      return constraints ? constraints : true;
    }
  },

  getResolutionConstraints: function() {
    if (this.hd === true) {
      return {
        mandatory: {
          minWidth: 1280,
          minHeight: 720
        }
      };
    } else {
      var width = this.settings.getResolutionEncodingWidth();
      var height = this.settings.getResolutionEncodingHeight();
      if (width && height) {
        if (height <= 480) {
          return {
            mandatory: {
              maxWidth: width,
              maxHeight: height
            }
          };
        } else {
          return {
            mandatory: {
              minWidth: width,
              minHeight: height
            }
          };
        }
      } else {
        return false;
      }
    }
  },

  getExSIPConfig: function(data) {
    data = data || {};
    var userid = data.userId || $.cookie('settingUserId') || this.networkUserId || Utils.randomUserid();

    var sip_uri = encodeURI(userid);
    if ((sip_uri.indexOf("@") === -1)) {
      sip_uri = (sip_uri + "@" + this.domainFrom);
    }

    var config = {
      'uri': sip_uri,
      'authorization_user': data.authenticationUserId || $.cookie('settingAuthenticationUserId') || userid,
      'ws_servers': this.websocketsServers,
      'stun_servers': 'stun:' + this.stunServer + ':' + this.stunPort,
      'trace_sip': this.debug,
      'enable_ims': this.enableIms,
      'p_asserted_identity': this.pAssertedIdentity,
      'enable_datachannel': this.enableWhiteboard || this.enableFileShare
    };

    // Add Display Name if set
    if (this.sipDisplayName) {
      config.display_name = this.sipDisplayName;
    }

    // do registration if setting User ID or configuration register is set
    if ($.cookie('settingUserId') || this.register) {
      config.register = true;
      config.password = data.password || $.cookie('settingPassword');
    } else {
      config.register = false;
    }
    return config;
  },

  getRtcMediaHandlerOptions: function() {
    var options = {
      reuseLocalMedia: this.enableConnectLocalMedia,
      videoBandwidth: this.settings.getBandwidth(),
      disableICE: this.disableICE,
      RTCConstraints: {
        'optional': [],
        'mandatory': {}
      }
    };
    return options;
  },

  setSettings: function(settings) {
    this.settings = settings;
  },

  isHD: function() {
    return this.enableHD === true && this.hd === true;
  },

  isWidescreen: function() {
    return this.isHD() || this.settings.resolutionType.val() === WebRTC_C.WIDESCREEN;
  },

  setResolutionDisplay: function(resolutionDisplay) {
    this.hd = false;
    this.settings.setResolutionDisplay(resolutionDisplay);
    events.emit('viewChanged');
  },

  getResolutionDisplay: function() {
    return this.isHD() ? WebRTC_C.R_1280x720 : this.settings.getResolutionDisplay();
  }
};