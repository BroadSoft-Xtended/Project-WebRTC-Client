require('./includes/common');
describe('settings', function() {

  beforeEach(function() {
    setUp();
    testUA.mockWebRTC();
    testUA.deleteAllCookies();
    config = {
      enableCallStats: false
    };
    $.cookie("settingsPassword", "");
  });

  it('settings icon', function() {
    config.enableSettings = true;
    client = create(config)
    testUA.isVisible(videobar.settings, true);
    expect(settingsview.attached).toEqual(false);
  });
  it('settings icon with enableSettings = false', function() {
    config.enableSettings = false;
    client = create(config)
    testUA.isVisible(videobar.settings, false);
    expect(settingsview.attached).toEqual(false);
  });
  it('settings icon after click', function() {
    config.enableSettings = true;
    client = create(config)
    videobar.settings.trigger('click');
    testUA.isVisible(videobar.settings, true);
    testUA.isVisible(settingsview.view, true);
    videobar.settings.trigger('click');
    testUA.isVisible(videobar.settings, true);
    testUA.isVisible(settingsview.view, false);
  });
  it('persist with active call', function() {
    client = create(config)
    var reload = false;
    settings.reload = function() {
      reload = true;
    }
    testUA.startCall();
    settingsview.save.trigger("click");
    expect(reload).toEqual(false);
    testUA.endCall();
    expect(reload).toEqual(true);
  });
  it('persist with userid set:', function() {
    client = create(config)
    settings.userid = 'someuserid' ;
    expect(settingsview.userid.val()).toEqual('someuserid');
    settingsview.save.trigger("click");
    expect($.cookie("settingsUserid")).toEqual("someuserid");
    expect($.cookie("settingsPassword")).toEqual("");
  });
  it('persist with display name set', function() {
    client = create(config)
    expect(settings.displayName).toEqual(undefined);
    settings.displayName = 'somedisplayname';
    settingsview.save.trigger("click");
    expect($.cookie("settingsDisplayName")).toEqual("somedisplayname");
    global.bdsft_client_instances = {};
    client = create(config);
    expect(settings.displayName).toEqual("somedisplayname");
  });
  it('resolution types with config set', function() {
    config.displayResolution = WebRTC.C.R_960x720;
    config.encodingResolution = WebRTC.C.R_320x240;
    client = create(config)
    expect(configuration.displayResolution).toEqual(WebRTC.C.R_960x720);
    expect(settings.resolutionDisplay).toEqual(WebRTC.C.R_960x720);
    expect(settings.resolutionEncoding).toEqual(WebRTC.C.R_320x240);
    config.displayResolution = null;
    config.encodingResolution = null;
  });
  it('persist with resolution set', function() {
    client = create(config)
    testUA.val(settingsview.resolutionType, WebRTC.C.STANDARD);
    testUA.val(settingsview.resolutionDisplayStandard, WebRTC.C.R_640x480);
    testUA.val(settingsview.resolutionEncodingStandard, WebRTC.C.R_640x480);
    settingsview.save.trigger("click");
    expect(settingsview.resolutionDisplayStandard.val()).toEqual(WebRTC.C.R_640x480);
    expect(settingsview.resolutionEncodingStandard.val()).toEqual(WebRTC.C.R_640x480);
    expect(settings.resolutionDisplay).toEqual(WebRTC.C.R_640x480);
    expect(settings.resolutionEncoding).toEqual(WebRTC.C.R_640x480);
    expect($.cookie("settingsResolutionDisplay")).toEqual(WebRTC.C.R_640x480);
    expect($.cookie("settingsResolutionEncoding")).toEqual(WebRTC.C.R_640x480);
    global.bdsft_client_instances = {};
    config.displayResolution = '';
    config.encodingResolution = '';
    client = create(config)
    expect(settingsview.resolutionType.val()).toEqual(WebRTC.C.STANDARD);
    expect(configuration.encodingResolution).toEqual(WebRTC.C.R_640x480);
    expect(settings.resolutionEncoding).toEqual(WebRTC.C.R_640x480);
    // TODO - this is not working
    // expect(settingsview.resolutionDisplayStandard.val()).toEqual(WebRTC.C.R_640x480);
    // expect(settingsview.resolutionEncodingStandard.val()).toEqual(WebRTC.C.R_640x480);
    $.cookie("settingsResolutionDisplay", "");
    $.cookie("settingsResolutionEncoding", "");
  });
  it('persist with password set', function() {
    client = create(config)
    settings.password = '121212';
    settingsview.save.trigger("click");
    expect($.cookie("settingsPassword")).toEqual('121212');
    expect(WebRTC.Utils.getSearchVariable("password")).toEqual(false);
    expect(settings.password).toEqual('121212');
    global.bdsft_client_instances = {};
    client = create(config)
    expect($.cookie("settingsPassword")).toEqual('121212');
    expect(settings.password).toEqual('121212');
    $.cookie("settingsPassword", "");
  });
  it('setResolution with standard resolution', function() {
    client = create(config)
    settings.resolutionDisplay = WebRTC.C.R_320x240;
    settings.resolutionEncoding = WebRTC.C.R_320x240;
    expect(settingsview.resolutionType.val()).toEqual(WebRTC.C.STANDARD);
    expect(settingsview.resolutionDisplayWidescreen.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionEncodingWidescreen.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionDisplayStandard.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionEncodingStandard.hasClass('hidden')).toEqual(false);
  });
  it('setResolution with widescreen resolution', function() {
    client = create(config)
    settings.resolutionDisplay = WebRTC.C.R_320x180;
    settings.resolutionEncoding = WebRTC.C.R_320x180;
    expect(settingsview.resolutionType.val()).toEqual(WebRTC.C.WIDESCREEN);
    expect(settingsview.resolutionDisplayWidescreen.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionEncodingWidescreen.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionDisplayStandard.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionEncodingStandard.hasClass('hidden')).toEqual(true);
  });
  it('change resolution type', function() {
    client = create(config)
    testUA.val(settingsview.resolutionType, 'standard');
    expect(settingsview.resolutionType.val()).toEqual('standard');
    expect(settings.resolutionType).toEqual('standard');
    expect(settingsview.resolutionDisplayWidescreen.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionEncodingWidescreen.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionDisplayStandard.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionEncodingStandard.hasClass('hidden')).toEqual(false);
  });
  it('change encoding resolution with different video resolution', function() {
    client = create(config)
    video.localWidth = function() {
      return 640;
    }
    video.localHeight = function() {
      return 480;
    }
    settingsview.resolutionEncodingStandard.val(WebRTC.C.R_960x720);
    settingsview.resolutionEncodingStandard.trigger('change');
    video.local.trigger("playing");
    expect(messagesview.normal.text().trim()).toEqual("");
    expect(messagesview.success.text().trim()).toEqual("");
    expect(messagesview.alert.text().trim()).toEqual("");
    expect(messagesview.warning.text().trim()).toEqual("");
  });
  it('hide or disable settings when config has corresponding attributes set', function() {
    config.enableAutoAnswer = true;
    var enableSelfView = ClientConfig.enableSelfView;
    var networkUserId = ClientConfig.networkUserId;
    var enableHD = ClientConfig.enableHD;
    var displayResolution = ClientConfig.displayResolution;
    var encodingResolution = ClientConfig.encodingResolution;
    var bandwidthLow = ClientConfig.bandwidthLow;
    var bandwidthMed = ClientConfig.bandwidthMed;
    var bandwidthHigh = ClientConfig.bandwidthHigh;
    var displayName = ClientConfig.displayName;

    delete ClientConfig.enableSelfView;
    delete ClientConfig.networkUserId;
    delete ClientConfig.enableHD;
    delete ClientConfig.displayResolution;
    delete ClientConfig.encodingResolution;
    delete ClientConfig.bandwidthLow;
    delete ClientConfig.bandwidthMed;
    delete ClientConfig.bandwidthHigh;
    delete ClientConfig.displayName;
    client = create(config)
    videobar.settings.trigger('click');
    //  expect(settings.selfViewDisableRow.is(":visible")).toEqual( false);
    //  expect(settings.settingBandwidthLow.is(":visible")).toEqual( false);
    //  expect(settings.settingBandwidthMed.is(":visible")).toEqual( false);
    //  expect(settings.settingBandwidthHigh.is(":visible")).toEqual( false);
    //  expect(settings.bandwidthRow.is(":visible")).toEqual( false);

    settingsview.configure.trigger('click');
    expect(settingsview.autoAnswerRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.useridRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.displayNameRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.hdRow.hasClass('hidden')).toEqual(false);

    settingsview.layout.trigger('click');
    expect(settingsview.resolutionRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionTypeRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionDisplayRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionEncodingRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.bandwidthLow.hasClass('hidden')).toEqual(false);
    expect(settingsview.bandwidthMed.hasClass('hidden')).toEqual(false);
    expect(settingsview.bandwidthHigh.hasClass('hidden')).toEqual(false);
    expect(settingsview.bandwidthRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.displayNameRow.hasClass('hidden')).toEqual(false);

    config.enableAutoAnswer = false;
    config.enableSelfView = false;
    config.networkUserId = '12345678';
    config.enableHD = false;
    config.displayResolution = '960x720';
    config.encodingResolution = '960x720';
    config.bandwidthLow = '256';
    config.bandwidthMed = '1024';
    config.bandwidthHigh = '2048';
    config.displayName = 'test display name';
    global.bdsft_client_instances = {};
    client = create(config)
    videobar.settings.trigger('click');
    expect(settingsview.autoAnswerRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.selfViewDisableRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.hdRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionTypeRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionDisplayRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionEncodingRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.bandwidthLow.hasClass('hidden')).toEqual(true);
    expect(settingsview.bandwidthMed.hasClass('hidden')).toEqual(true);
    expect(settingsview.bandwidthHigh.hasClass('hidden')).toEqual(true);
    expect(settingsview.bandwidthRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.displayNameRow.hasClass('hidden')).toEqual(true);

    delete config.displayResolution;
    global.bdsft_client_instances = {};
    client = create(config)
    videobar.settings.trigger('click');
    settingsview.layout.trigger('click');
    expect(settingsview.resolutionRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionTypeRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionDisplayRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionEncodingRow.hasClass('hidden')).toEqual(true);

    delete config.encodingResolution;
    config.displayResolution = '960x720';
    global.bdsft_client_instances = {};
    client = create(config)
    videobar.settings.trigger('click');
    settingsview.layout.trigger('click');
    expect(settingsview.resolutionRow.hasClass('hidden')).toEqual(false);
    expect(settingsview.resolutionTypeRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionDisplayRow.hasClass('hidden')).toEqual(true);
    expect(settingsview.resolutionEncodingRow.hasClass('hidden')).toEqual(false);

    ClientConfig.enableSelfView = enableSelfView;
    ClientConfig.networkUserId = networkUserId;
    ClientConfig.enableHD = enableHD;
    ClientConfig.displayResolution = displayResolution;
    ClientConfig.encodingResolution = encodingResolution;
    ClientConfig.bandwidthLow = bandwidthLow;
    ClientConfig.bandwidthMed = bandwidthMed;
    ClientConfig.bandwidthHigh = bandwidthHigh;
    ClientConfig.displayName = displayName;
  });
});