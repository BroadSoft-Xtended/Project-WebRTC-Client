module.exports = SettingsView;

var WebRTC_C = require('webrtc-core/Constants');
var Utils = require('webrtc-core/Utils');
var PopupView = require('./popup');

function SettingsView(settings, configuration, eventbus, debug, sound) {
  var self = {};

  Utils.extend(self, PopupView(eventbus));

  var updateRowVisibility = function() {
    self.autoAnswerRow.toggleClass('hidden', configuration.hasOwnProperty("enableAutoAnswer"));
    self.selfViewDisableRow.toggleClass('hidden', configuration.hasOwnProperty("enableSelfView"));
    self.hdRow.toggleClass('hidden', configuration.hasOwnProperty("enableHD"));
    self.resolutionRow.toggleClass('hidden', configuration.hasOwnProperty("displayResolution") && configuration.hasOwnProperty("encodingResolution"));
    self.resolutionDisplayRow.toggleClass('hidden', configuration.hasOwnProperty("displayResolution"));
    self.resolutionEncodingRow.toggleClass('hidden', configuration.hasOwnProperty("encodingResolution"));
    self.resolutionTypeRow.toggleClass('hidden', configuration.hasOwnProperty("displayResolution") || configuration.hasOwnProperty("encodingResolution"));
    self.bandwidthLow.toggleClass('hidden', configuration.hasOwnProperty("bandwidthLow"));
    self.bandwidthMed.toggleClass('hidden', configuration.hasOwnProperty("bandwidthMed"));
    self.bandwidthHigh.toggleClass('hidden', configuration.hasOwnProperty("bandwidthHigh"));
    self.bandwidthRow.toggleClass('hidden', configuration.hasOwnProperty("bandwidthLow") && configuration.hasOwnProperty("bandwidthMed") && configuration.hasOwnProperty("bandwidthHigh"));
    self.displayNameRow.toggleClass('hidden', configuration.hasOwnProperty("displayName"));
  };

  self.elements = ['userid', 'password', 'save', 'authenticationUserid', 'signIn', 'signOut',
    'displayName', 'resolutionType', 'resolutionDisplayWidescreen', 'resolutionDisplayStandard', 'resolutionEncodingWidescreen',
    'resolutionEncodingStandard', 'bandwidthLow', 'bandwidthMed', 'bandwidthHigh', 'displayNameRow', 'useridRow', 'selfViewDisableRow',
    'hdRow', 'autoAnswerRow', 'resolutionTypeRow', 'resolutionDisplayRow', 'resolutionEncodingRow', 'resolutionRow', 'bandwidthRow',
    'selfViewDisable', 'hd', 'size', 'autoAnswer', 'configure',
    'layout', 'clear', 'tabs'
  ];

  self.init = function(options) {
    Utils.addSelectOptions(WebRTC_C.RESOLUTION_TYPES, self.resolutionType);
    Utils.addSelectOptions(WebRTC_C.STANDARD_RESOLUTIONS, self.resolutionDisplayStandard);
    Utils.addSelectOptions(WebRTC_C.WIDESCREEN_RESOLUTIONS, self.resolutionDisplayWidescreen);
    Utils.addSelectOptions(WebRTC_C.STANDARD_RESOLUTIONS, self.resolutionEncodingStandard);
    Utils.addSelectOptions(WebRTC_C.WIDESCREEN_RESOLUTIONS, self.resolutionEncodingWidescreen);

    settings.setResolutionDisplay(WebRTC_C.DEFAULT_RESOLUTION_DISPLAY);
    settings.setResolutionEncoding(WebRTC_C.DEFAULT_RESOLUTION_ENCODING);
    

    updateRowVisibility();
  };

  self.listeners = function() {
    eventbus.on("viewChanged", function(e) {
      if (e.view === 'dialpad' && e.visible) {
        self.hide();
      }
    });
    eventbus.on(['registered', 'unregistered', 'registrationFailed'], function() {
      self.enableRegistration(true);
    });
    eventbus.on(['signIn', 'signOut'], function() {
      self.enableRegistration(false);
    });
    eventbus.on("resolutionChanged", function() {
      self.updateResolutionSelectVisibility();
    });
    self.clear.on('click', function(e) {
      e.preventDefault();
      settings.resetLayout();
      eventbus.emit('message', {
        text: 'Settings reset'
      });
    });
    self.signOut.on('click', function(e) {
      e.preventDefault();
      sound.playClick();
      settings.signOut();
    });
    self.save.bind('click', function(e) {
      e.preventDefault();
      sound.playClick();
      settings.save();
      self.hide();
    });
    self.signIn.bind('click', function(e) {
      e.preventDefault();
      sound.playClick();
      settings.signIn();
    });
    Utils.toArray([self.bandwidthLow, self.bandwidthMed, self.bandwidthHigh]).on('blur', function() {
      eventbus.bandwidthChanged(settings);
    });
    Utils.toArray([self.resolutionType, self.resolutionDisplayWidescreen, self.resolutionDisplayStandard, 
      self.resolutionEncodingWidescreen, self.resolutionEncodingStandard]).on('change', function() {
      eventbus.resolutionChanged(settings);
    });
    self.tabs.each(function() {
      var active, activeTabSel, links = $(this).find('a');
      active = $(links.filter('[href="' + location.hash + '"]')[0] || links[0]);
      active.addClass('active');
      activeTabSel = active[0].hash;
      links.not(active).each(function() {
        $(this.hash).hide();
      });
      $(this).on('click', 'a', function(e) {
        e.preventDefault();
        active.removeClass('active');
        $(activeTabSel).hide();
        active = $(this);
        activeTabSel = this.hash;
        active.addClass('active');
        $(activeTabSel).show();
      });
    });
  };

  self.updateResolutionSelectVisibility = function() {
    var resolutionType = self.resolutionType.val();
    self.resolutionDisplayStandard.toggleClass('hidden', resolutionType !== WebRTC_C.STANDARD);
    self.resolutionEncodingStandard.toggleClass('hidden', resolutionType !== WebRTC_C.STANDARD);
    self.resolutionDisplayWidescreen.toggleClass('hidden', resolutionType !== WebRTC_C.WIDESCREEN);
    self.resolutionEncodingWidescreen.toggleClass('hidden', resolutionType !== WebRTC_C.WIDESCREEN);
  };
  self.enableRegistration = function(enable) {
    self.signIn.removeClass("disabled");
    self.signOut.removeClass("disabled");
    if (!enable) {
      self.signIn.addClass("disabled");
      self.signOut.addClass("disabled");
    }
  };

  return self;
}