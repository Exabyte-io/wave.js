"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThreeDEditor = void 0;
var _theme = require("@exabyte-io/cove.js/dist/theme");
var _provider = _interopRequireDefault(require("@exabyte-io/cove.js/dist/theme/provider"));
var _made = require("@mat3ra/made");
var _Article = _interopRequireDefault(require("@mui/icons-material/Article"));
var _Autorenew = _interopRequireDefault(require("@mui/icons-material/Autorenew"));
var _Check = _interopRequireDefault(require("@mui/icons-material/Check"));
var _CloudDownload = _interopRequireDefault(require("@mui/icons-material/CloudDownload"));
var _ControlCameraRounded = _interopRequireDefault(require("@mui/icons-material/ControlCameraRounded"));
var _Dehaze = _interopRequireDefault(require("@mui/icons-material/Dehaze"));
var _Delete = _interopRequireDefault(require("@mui/icons-material/Delete"));
var _Edit = _interopRequireDefault(require("@mui/icons-material/Edit"));
var _FormatShapes = _interopRequireDefault(require("@mui/icons-material/FormatShapes"));
var _GpsFixed = _interopRequireDefault(require("@mui/icons-material/GpsFixed"));
var _Height = _interopRequireDefault(require("@mui/icons-material/Height"));
var _ImportExport = _interopRequireDefault(require("@mui/icons-material/ImportExport"));
var _Looks = _interopRequireDefault(require("@mui/icons-material/Looks"));
var _PictureInPicture = _interopRequireDefault(require("@mui/icons-material/PictureInPicture"));
var _RemoveRedEye = _interopRequireDefault(require("@mui/icons-material/RemoveRedEye"));
var _Replay = _interopRequireDefault(require("@mui/icons-material/Replay"));
var _Settings = _interopRequireDefault(require("@mui/icons-material/Settings"));
var _Spellcheck = _interopRequireDefault(require("@mui/icons-material/Spellcheck"));
var _SquareFoot = _interopRequireDefault(require("@mui/icons-material/SquareFoot"));
var _SwitchCamera = _interopRequireDefault(require("@mui/icons-material/SwitchCamera"));
var _ThreeDRotation = _interopRequireDefault(require("@mui/icons-material/ThreeDRotation"));
var _ScopedCssBaseline = _interopRequireDefault(require("@mui/material/ScopedCssBaseline"));
var _jquery = _interopRequireDefault(require("jquery"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _react = _interopRequireDefault(require("react"));
var _settings = _interopRequireDefault(require("../settings"));
var _utils = require("../utils");
var _IconsToolbar = _interopRequireDefault(require("./IconsToolbar"));
var _ParametersMenu = _interopRequireDefault(require("./ParametersMenu"));
var _ThreejsEditorModal = require("./ThreejsEditorModal");
var _WaveComponent = require("./WaveComponent");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /* eslint-disable react/sort-comp */ // import "../MuiClassNameSetup";
/**
 * Wrapper component containing 3D visualization through `WaveComponent` and the associated controls
 */
class ThreeDEditor extends _react.default.Component {
  /**
   * Create a ThreeDEditor component
   * @param props Properties as explained below
   */
  constructor(props) {
    super(props);
    _defineProperty(this, "handleSetSetting", setting => {
      const {
        viewerSettings
      } = this.state;
      this.setState({
        viewerSettings: {
          ...viewerSettings,
          ...setting
        }
      });
    });
    // map of hotkeys to their handlers
    _defineProperty(this, "keyConfig", {
      [_settings.default.hotKeysConfig.toggleOrbitControls]: this.handleToggleOrbitControls,
      [_settings.default.hotKeysConfig.toggleInteractive]: this.handleToggleInteractive,
      [_settings.default.hotKeysConfig.toggleBonds]: this.handleToggleBonds,
      [_settings.default.hotKeysConfig.toggleConventionalCell]: this.handleToggleConventionalCell,
      [_settings.default.hotKeysConfig.toggleLabels]: this.handleToggleLabels,
      [_settings.default.hotKeysConfig.resetViewer]: this.handleResetViewer,
      [_settings.default.hotKeysConfig.toggleThreejsEditorModal]: this.toggleThreejsEditorModal,
      [_settings.default.hotKeysConfig.toggleDistanceShown]: this.handleToggleDistanceShown,
      [_settings.default.hotKeysConfig.toggleAnglesShown]: this.handleToggleAnglesShown,
      [_settings.default.hotKeysConfig.deleteConnection]: this.handleDeleteConnection
    });
    _defineProperty(this, "handleKeyPress", e => {
      const {
        isInteractive,
        isThreejsEditorModalShown
      } = this.state;
      const {
        editable
      } = this.props;

      // Check if interactive mode is off, or if the event originated from an input-like element
      if (!isInteractive || e.target.closest(".cm-editor") || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.nodeName) || isThreejsEditorModalShown) {
        return;
      }

      // Removing the toggleThreejsEditorModal key from the keyConfig if the editor is not editable
      const keyConfigAdjusted = {
        ...this.keyConfig
      };
      if (!editable) {
        delete keyConfigAdjusted[_settings.default.hotKeysConfig.toggleThreejsEditorModal];
      }
      const handler = keyConfigAdjusted[e.key.toLowerCase()];
      if (handler) {
        handler.call(this);
      }
    });
    _defineProperty(this, "getViewSettingsActions", () => {
      const {
        viewerSettings,
        isConventionalCellShown
      } = this.state;
      return [{
        id: "rotate-zoom",
        disabled: false,
        content: "Rotate/Zoom [O]",
        leftIcon: /*#__PURE__*/_react.default.createElement(_ThreeDRotation.default, null),
        rightIcon: this.getCheckmark(this._getWaveProperty("areOrbitControlsEnabled")),
        onClick: this.handleToggleOrbitControls,
        shouldMenuStayOpened: true
      }, {
        id: "auto-rotate",
        disabled: false,
        content: "Auto Rotate",
        leftIcon: /*#__PURE__*/_react.default.createElement(_Autorenew.default, null),
        rightIcon: this.getCheckmark(this._getWaveProperty("isOrbitControlsAnimationEnabled")),
        onClick: this.handleToggleOrbitControlsAnimation,
        shouldMenuStayOpened: true
      }, {
        id: "toggle-axes",
        disabled: false,
        content: "Axes",
        leftIcon: /*#__PURE__*/_react.default.createElement(_GpsFixed.default, null),
        rightIcon: this.getCheckmark(this._getWaveProperty("areAxesEnabled")),
        onClick: this.handleToggleAxes,
        shouldMenuStayOpened: true
      }, {
        id: "toggle-camera",
        disabled: false,
        content: "Orthographic Camera",
        leftIcon: /*#__PURE__*/_react.default.createElement(_SwitchCamera.default, null),
        rightIcon: this.getCheckmark(this._getWaveProperty("isCameraOrthographic")),
        onClick: this.handleToggleOrthographicCamera,
        shouldMenuStayOpened: true
      }, {
        id: "toggle-bonds",
        disabled: false,
        content: "Bonds [B]",
        leftIcon: /*#__PURE__*/_react.default.createElement(_Dehaze.default, null),
        rightIcon: this.getCheckmark(this._getWaveProperty("isDrawBondsEnabled")),
        onClick: this.handleToggleBonds,
        shouldMenuStayOpened: true
      }, {
        id: "toggle-cell",
        disabled: false,
        content: "Conventional Cell [C]",
        leftIcon: /*#__PURE__*/_react.default.createElement(_FormatShapes.default, null),
        rightIcon: this.getCheckmark(isConventionalCellShown),
        onClick: this.handleToggleConventionalCell,
        shouldMenuStayOpened: true
      }, {
        id: "toggle-labels",
        disabled: false,
        content: "Labels [L]",
        leftIcon: /*#__PURE__*/_react.default.createElement(_Spellcheck.default, null),
        rightIcon: this.getCheckmark(this._getWaveProperty("areLabelsShown")),
        onClick: this.handleToggleLabels,
        shouldMenuStayOpened: true
      }, {
        id: "toggle-view-adjustment",
        disabled: false,
        content: "Auto-center on change",
        leftIcon: /*#__PURE__*/_react.default.createElement(_ControlCameraRounded.default, null),
        rightIcon: this.getCheckmark(viewerSettings.isViewAdjustable),
        onClick: this.handleToggleIsViewAdjustable,
        shouldMenuStayOpened: true
      }, {
        id: "divider-2",
        isDivider: true
      }, {
        id: "reset-view",
        disabled: false,
        content: "Reset View [R]",
        leftIcon: /*#__PURE__*/_react.default.createElement(_Replay.default, null),
        onClick: this.handleResetViewer,
        shouldMenuStayOpened: true
      }];
    });
    _defineProperty(this, "getMeasurementsActions", () => {
      const {
        measurementsSettings
      } = this.state;
      const {
        isDistanceShown,
        isAnglesShown
      } = measurementsSettings;
      return [{
        id: "Distances",
        content: "Distances [D]",
        rightIcon: this.getCheckmark(isDistanceShown),
        leftIcon: /*#__PURE__*/_react.default.createElement(_Height.default, null),
        onClick: this.handleToggleDistanceShown,
        shouldMenuStayOpened: true
      }, {
        id: "Angles",
        content: "Angles [A]",
        rightIcon: this.getCheckmark(isAnglesShown),
        leftIcon: /*#__PURE__*/_react.default.createElement(_Looks.default, null),
        onClick: this.handleToggleAnglesShown,
        shouldMenuStayOpened: true
      }, {
        id: "Delete",
        content: "Delete connection [X]",
        leftIcon: /*#__PURE__*/_react.default.createElement(_Delete.default, null),
        onClick: this.handleDeleteConnection,
        shouldMenuStayOpened: true
      }, {
        id: "divider-actions",
        isDivider: true
      }, {
        id: "Reset measurements",
        content: "Reset measurements",
        leftIcon: /*#__PURE__*/_react.default.createElement(_Replay.default, null),
        onClick: this.handleResetMeasurements,
        shouldMenuStayOpened: true
      }];
    });
    _defineProperty(this, "getExportActions", () => {
      const downloadActions = [{
        id: "JSON",
        title: "JSON",
        content: "JSON",
        leftIcon: /*#__PURE__*/_react.default.createElement(_Article.default, null),
        onClick: () => this.handleDownloadClick("json")
      }, {
        id: "POSCAR",
        title: "POSCAR",
        content: "POSCAR",
        leftIcon: /*#__PURE__*/_react.default.createElement(_Article.default, null),
        onClick: () => this.handleDownloadClick("poscar")
      }];
      return [{
        id: "StartGif",
        title: "Auto Rotate GIF",
        content: "Auto Rotate GIF",
        leftIcon: /*#__PURE__*/_react.default.createElement(_PictureInPicture.default, null),
        onClick: this.handleStartGifRecording
      }, {
        id: "Screenshot",
        title: "Screenshot",
        content: "Screenshot",
        leftIcon: /*#__PURE__*/_react.default.createElement(_PictureInPicture.default, null),
        onClick: this.handleTakeScreenshot
      }, {
        id: "Download",
        title: "Download",
        content: "Download",
        leftIcon: /*#__PURE__*/_react.default.createElement(_CloudDownload.default, null),
        actions: downloadActions,
        paperPlacement: "right-start"
      }];
    });
    _defineProperty(this, "getParametersActions", () => {
      const {
        viewerSettings
      } = this.state;
      return /*#__PURE__*/_react.default.createElement(_ParametersMenu.default, {
        viewerSettings: viewerSettings,
        handleSphereRadiusChange: this.handleSphereRadiusChange,
        handleCellRepetitionsChange: this.handleCellRepetitionsChange,
        handleChemicalConnectivityFactorChange: this.handleChemicalConnectivityFactorChange
      });
    });
    _defineProperty(this, "handleStartGifRecording", (downloadPath, rotationSpeed = 60, frameDuration = 0.05) => {
      this.WaveComponent.wave.takeGifScreenshot({
        rotationSpeed,
        frameDuration,
        downloadPath
      }).then(result => {
        console.log("Recorded gif", result);
      });
    });
    _defineProperty(this, "handleMessage", event => {
      if (event.data && event.data.material) {
        try {
          const newMaterial = new _made.Made.Material(event.data.material);
          this.setState({
            originalMaterial: newMaterial,
            material: newMaterial.clone()
          }, () => {
            // Force Wave component to update after state change
            if (this.WaveComponent) {
              this.WaveComponent.wave.rebuildScene();
            }
          });
        } catch (error) {
          alert("Error creating material: " + error.message);
        }
      } else if (event.data && event.data.action && this[event.data.action]) {
        const {
          action,
          parameters
        } = event.data;
        this[action](...parameters);
      }
    });
    const {
      boundaryConditions,
      isConventionalCellShown: _isConventionalCellShown,
      material
    } = this.props;
    // TODO : overloading a bunch of props and state attributes here..
    this.state = {
      // on/off switch for the component
      isInteractive: false,
      activeToolbarMenu: null,
      isThreejsEditorModalShown: false,
      // isDistanceAndAnglesShown: false,
      measurementsSettings: {
        isDistanceShown: false,
        isAnglesShown: false,
        measurementLabelsShown: false,
        distance: 0,
        angle: 0
      },
      // TODO: remove the need for `viewerTriggerResize`
      // whether to trigger resize
      viewerTriggerResize: false,
      // Settings of the wave viewer
      viewerSettings: {
        isViewAdjustable: _settings.default.isViewAdjustable,
        atomRadiiScale: _settings.default.atomRadiiScale,
        repetitionsAlongLatticeVectorA: _settings.default.repetitions,
        repetitionsAlongLatticeVectorB: _settings.default.repetitions,
        repetitionsAlongLatticeVectorC: _settings.default.repetitions,
        chemicalConnectivityFactor: _settings.default.chemicalConnectivityFactor
      },
      boundaryConditions,
      isConventionalCellShown: _isConventionalCellShown,
      // material that is originally passed to the component and can be modified in ThreejsEditorModal component.
      originalMaterial: material,
      // material that is passed to WaveComponent to be visualized and may have repetition and radius adjusted.
      material: props.material.clone()
    };
    this.handleCellRepetitionsChange = this.handleCellRepetitionsChange.bind(this);
    this.handleSphereRadiusChange = this.handleSphereRadiusChange.bind(this);
    this.handleDownloadClick = this.handleDownloadClick.bind(this);
    this.handleToggleInteractive = this.handleToggleInteractive.bind(this);
    this.handleToggleToolbarMenu = this.handleToggleToolbarMenu.bind(this);
    this.handleToggleBonds = this.handleToggleBonds.bind(this);
    this.toggleThreejsEditorModal = this.toggleThreejsEditorModal.bind(this);
    this.handleToggleOrthographicCamera = this.handleToggleOrthographicCamera.bind(this);
    this.handleToggleLabels = this.handleToggleLabels.bind(this);
    this.handleToggleConventionalCell = this.handleToggleConventionalCell.bind(this);
    this.handleToggleIsViewAdjustable = this.handleToggleIsViewAdjustable.bind(this);
    this.handleResetViewer = this.handleResetViewer.bind(this);
    this.handleTakeScreenshot = this.handleTakeScreenshot.bind(this);
    this.handleToggleOrbitControls = this.handleToggleOrbitControls.bind(this);
    this.handleToggleOrbitControlsAnimation = this.handleToggleOrbitControlsAnimation.bind(this);
    this.handleToggleAxes = this.handleToggleAxes.bind(this);
    this.onThreejsEditorModalHide = this.onThreejsEditorModalHide.bind(this);
    this.handleChemicalConnectivityFactorChange = this.handleChemicalConnectivityFactorChange.bind(this);
    this.handleToggleDistanceShown = this.handleToggleDistanceShown.bind(this);
    this.handleToggleAnglesShown = this.handleToggleAnglesShown.bind(this);
    this.handleSetState = this.handleSetState.bind(this);
    this.handleDeleteConnection = this.handleDeleteConnection.bind(this);
    this.handleResetMeasurements = this.handleResetMeasurements.bind(this);
    this.offMeasurementParam = this.offMeasurementParam.bind(this);
    this.onMeasurementParam = this.onMeasurementParam.bind(this);
    this.addHotKeyListener = this.addHotKeyListener.bind(this);
    this.removeHotKeyListener = this.removeHotKeyListener.bind(this);
    this.handleStartGifRecording = this.handleStartGifRecording.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.doWaveFunc = this.doWaveFunc.bind(this);
  }
  componentDidMount() {
    this.addHotKeyListener();
    window.addEventListener("message", this.handleMessage);
  }
  componentWillUnmount() {
    this.handleResetMeasurements();
    this.WaveComponent.wave.destroyListeners();
    this.removeHotKeyListener();
    window.removeEventListener("message", this.handleMessage);
  }

  // TODO: update component to fully controlled or fully uncontrolled with a key?
  // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
  // eslint-disable-next-line no-unused-vars
  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    const {
      material
    } = nextProps;
    if (material) {
      this.setState({
        material: material.clone(),
        originalMaterial: material,
        boundaryConditions: nextProps.boundaryConditions || {},
        isConventionalCellShown: nextProps.isConventionalCellShown || false
      });
      this.handleResetMeasurements();
    }
  }
  _resetStateWaveComponent() {
    // a workaround to re-render the component and update the buttons on clicks
    // eslint-disable-next-line react/no-unused-state
    this.setState({
      wave: this.WaveComponent.wave
    });
  }
  addHotKeyListener() {
    document.addEventListener("keypress", this.handleKeyPress, true);
  }
  removeHotKeyListener() {
    document.removeEventListener("keypress", this.handleKeyPress);
  }
  handleCellRepetitionsChange(e) {
    this.handleSetSetting({
      [e.target.id]: parseFloat((0, _jquery.default)(e.target).val())
    });
  }
  handleSphereRadiusChange(e) {
    this.handleSetSetting({
      atomRadiiScale: parseFloat((0, _jquery.default)(e.target).val())
    });
  }
  handleToggleOrthographicCamera() {
    this.WaveComponent.wave.toggleOrthographicCamera();
    this._resetStateWaveComponent();
  }
  handleToggleLabels() {
    this.WaveComponent.wave.toggleLabels();
    this._resetStateWaveComponent();
  }
  handleChemicalConnectivityFactorChange(e) {
    this.handleSetSetting({
      chemicalConnectivityFactor: parseFloat((0, _jquery.default)(e.target).val())
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getPrimitiveOrConventionalMaterial(material, isConventionalCellShown = false) {
    return isConventionalCellShown ? material.getACopyWithConventionalCell() : material.clone();
  }
  handleToggleConventionalCell() {
    const {
      isConventionalCellShown,
      originalMaterial
    } = this.state;
    this.handleResetMeasurements();
    this.setState({
      isConventionalCellShown: !isConventionalCellShown,
      originalMaterial: this.getPrimitiveOrConventionalMaterial(originalMaterial, !isConventionalCellShown)
    });
  }
  handleToggleIsViewAdjustable() {
    const {
      viewerSettings: {
        isViewAdjustable
      }
    } = this.state;
    this.handleSetSetting({
      isViewAdjustable: !isViewAdjustable
    });
  }
  handleDownloadClick(format = "poscar") {
    const {
      originalMaterial
    } = this.state;
    let content;
    switch (format) {
      case "poscar":
        content = originalMaterial.getAsPOSCAR();
        break;
      default:
        content = JSON.stringify(originalMaterial.toJSON());
    }
    (0, _utils.exportToDisk)(content, originalMaterial.name, format);
  }
  handleToggleInteractive() {
    const {
      isInteractive
    } = this.state;
    this.setState({
      isInteractive: !isInteractive
    });
  }
  handleToggleToolbarMenu(toolbarMenuName) {
    this.setState(prevState => ({
      activeToolbarMenu: prevState.activeToolbarMenu === toolbarMenuName ? null : toolbarMenuName
    }));
  }
  handleToggleBonds() {
    const {
      wave
    } = this.WaveComponent;
    wave.isDrawBondsEnabled = !wave.isDrawBondsEnabled; // toggle value;
    this._resetStateWaveComponent();
  }
  toggleThreejsEditorModal() {
    const {
      isThreejsEditorModalShown
    } = this.state;
    this.setState({
      isThreejsEditorModalShown: !isThreejsEditorModalShown
    });
  }

  // TODO: reset the colors for other buttons in the panel on call to the function below
  handleResetViewer() {
    const {
      measurementsSettings
    } = this.state;
    this.setState({
      measurementsSettings: {
        ...measurementsSettings,
        isDistanceShown: false,
        isAnglesShown: false
      }
    });
    this.WaveComponent.initViewer();
    this._resetStateWaveComponent();
  }
  handleTakeScreenshot() {
    this.WaveComponent.wave.takeScreenshot();
  }
  handleToggleOrbitControls() {
    this.WaveComponent.wave.toggleOrbitControls();
    this._resetStateWaveComponent();
  }
  handleToggleOrbitControlsAnimation() {
    this.WaveComponent.wave.toggleOrbitControlsAnimation();
    this._resetStateWaveComponent();
  }
  handleToggleAxes() {
    this.WaveComponent.wave.toggleAxes();
    this._resetStateWaveComponent();
  }
  _getWaveProperty(name) {
    return this.WaveComponent && this.WaveComponent.wave[name];
  }
  handleSetState(newState) {
    this.setState(newState);
  }
  handleDeleteConnection() {
    this.WaveComponent.wave.deleteConnection();
  }
  handleToggleDistanceShown() {
    const {
      measurementsSettings
    } = this.state;
    const {
      isDistanceShown,
      isAnglesShown
    } = measurementsSettings;
    if (isAnglesShown) {
      this.offMeasurementParam("isAnglesShown");
    }
    if (!isDistanceShown) {
      this.onMeasurementParam("isDistanceShown", "isAnglesShown");
    } else {
      this.offMeasurementParam("isDistanceShown");
    }
  }
  handleResetMeasurements() {
    const {
      measurementsSettings
    } = this.state;
    const {
      isDistanceShown,
      isAnglesShown
    } = measurementsSettings;
    if (isDistanceShown || isAnglesShown) this.WaveComponent.wave.resetMeasurements();
  }
  offMeasurementParam(param) {
    this.WaveComponent.wave.destroyListeners();
    this.handleResetMeasurements();
    this.setState(prevState => {
      const {
        measurementsSettings
      } = prevState;
      return {
        ...prevState,
        measurementsSettings: {
          ...measurementsSettings,
          [param]: false
        }
      };
    });
  }
  onMeasurementParam(param, offParam) {
    this.setState(prevState => {
      const {
        measurementsSettings
      } = prevState;
      return {
        ...prevState,
        measurementsSettings: {
          ...measurementsSettings,
          [param]: true
        }
      };
    });
    const {
      measurementsSettings
    } = this.state;
    this.WaveComponent.wave.initListeners(this.handleSetState, {
      ...measurementsSettings,
      [param]: true,
      [offParam]: false
    });
  }
  handleToggleAnglesShown() {
    const {
      measurementsSettings
    } = this.state;
    const {
      isAnglesShown,
      isDistanceShown
    } = measurementsSettings;
    if (isDistanceShown) {
      this.offMeasurementParam("isDistanceShown");
    }
    if (!isAnglesShown) {
      this.onMeasurementParam("isAnglesShown", "isDistanceShown");
    } else {
      this.offMeasurementParam("isAnglesShown");
    }
  }

  /**
   * Returns a cover div to cover the area and prevent user interaction with component
   */
  renderCoverDiv() {
    const style = {
      position: "absolute",
      height: "100%",
      width: "100%"
    };
    const {
      isInteractive
    } = this.state;
    if (isInteractive) style.display = "none";
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "atom-view-cover",
      style: style
    });
  }
  renderWaveComponent() {
    const {
      isConventionalCellShown,
      viewerSettings,
      viewerTriggerResize,
      boundaryConditions,
      material
    } = this.state;
    const materialCopy = this.getPrimitiveOrConventionalMaterial(material, isConventionalCellShown);
    const isDrawBondsEnabled = this._getWaveProperty("isDrawBondsEnabled") || false;
    return /*#__PURE__*/_react.default.createElement(_WaveComponent.WaveComponent, {
      ref: el => {
        this.WaveComponent = el;
      },
      triggerHandleResize: viewerTriggerResize,
      isConventionalCellShown: isConventionalCellShown,
      isDrawBondsEnabled: isDrawBondsEnabled,
      isViewAdjustable: viewerSettings.isViewAdjustable,
      structure: materialCopy,
      boundaryConditions: boundaryConditions,
      cell: materialCopy.Lattice.unitCell,
      name: materialCopy.name,
      settings: viewerSettings
    });
  }

  // TODO: move in the toolbar component when it's created
  // eslint-disable-next-line class-methods-use-this
  getCheckmark(isActive) {
    if (isActive) {
      return /*#__PURE__*/_react.default.createElement(_Check.default, {
        style: {
          color: _theme.DarkMaterialUITheme.palette.success.main
        }
      });
    }
    return /*#__PURE__*/_react.default.createElement(_Check.default, {
      style: {
        color: _theme.DarkMaterialUITheme.palette.grey[800]
      }
    });
  }
  getToolbarConfig() {
    const toolbarConfig = [{
      id: "View",
      title: "View",
      header: "View",
      leftIcon: /*#__PURE__*/_react.default.createElement(_RemoveRedEye.default, null),
      actions: this.getViewSettingsActions(),
      onClick: () => this.handleToggleToolbarMenu("view-settings")
    }, {
      id: "Parameters",
      title: "Parameters",
      header: "Parameters",
      leftIcon: /*#__PURE__*/_react.default.createElement(_Settings.default, null),
      contentObject: this.getParametersActions(),
      onClick: () => this.handleToggleToolbarMenu("parameters")
    }, {
      id: "measurements",
      title: "Measurements",
      header: "Measurements",
      leftIcon: /*#__PURE__*/_react.default.createElement(_SquareFoot.default, null),
      actions: this.getMeasurementsActions(),
      onClick: () => this.handleToggleToolbarMenu("measurements")
    }, {
      id: "Export",
      title: "Export",
      header: "Export",
      leftIcon: /*#__PURE__*/_react.default.createElement(_ImportExport.default, null),
      actions: this.getExportActions(),
      onClick: () => this.handleToggleToolbarMenu("export")
    }];
    const {
      editable
    } = this.props;
    if (editable) {
      toolbarConfig.splice(4, 0, {
        id: "3DEdit",
        title: "Edit [E]",
        leftIcon: /*#__PURE__*/_react.default.createElement(_Edit.default, null),
        onClick: this.toggleThreejsEditorModal
      });
    }
    return toolbarConfig;
  }
  onThreejsEditorModalHide(material) {
    let {
      isThreejsEditorModalShown
    } = this.state;
    isThreejsEditorModalShown = !isThreejsEditorModalShown;
    if (material) {
      const {
        originalMaterial
      } = this.state;
      const {
        onUpdate
      } = this.props;
      // preserve lattice type
      material.lattice = {
        ...material.Lattice.toJSON(),
        type: originalMaterial.Lattice.type
      };
      this.setState({
        originalMaterial: material,
        material: material.clone(),
        isThreejsEditorModalShown
      });
      if (onUpdate) onUpdate(material);
    } else {
      this.setState({
        isThreejsEditorModalShown
      });
    }
  }
  renderWaveOrThreejsEditorModal() {
    const {
      originalMaterial,
      isThreejsEditorModalShown
    } = this.state;
    if (isThreejsEditorModalShown) {
      return /*#__PURE__*/_react.default.createElement(_ThreejsEditorModal.ThreejsEditorModal, {
        show: isThreejsEditorModalShown,
        onHide: this.onThreejsEditorModalHide,
        materials: [originalMaterial],
        modalId: "threejs-editor"
      });
    }
    const {
      isInteractive
    } = this.state;
    return /*#__PURE__*/_react.default.createElement("div", {
      style: {
        position: "relative"
      }
    }, this.renderCoverDiv(), /*#__PURE__*/_react.default.createElement(_IconsToolbar.default, {
      toolbarConfig: this.getToolbarConfig(),
      isInteractive: isInteractive,
      handleToggleInteractive: this.handleToggleInteractive
    }), this.renderWaveComponent());
  }
  render() {
    return /*#__PURE__*/_react.default.createElement(_provider.default, {
      theme: _theme.DarkMaterialUITheme
    }, /*#__PURE__*/_react.default.createElement(_ScopedCssBaseline.default, {
      enableColorScheme: true
    }, this.renderWaveOrThreejsEditorModal()));
  }
  doWaveFunc(func, ...args) {
    this.WaveComponent.wave[func](...args);
  }
}
exports.ThreeDEditor = ThreeDEditor;
ThreeDEditor.propTypes = {
  material: _propTypes.default.instanceOf(_made.Made.Material).isRequired,
  editable: _propTypes.default.bool,
  isConventionalCellShown: _propTypes.default.bool,
  // eslint-disable-next-line react/forbid-prop-types
  boundaryConditions: _propTypes.default.object,
  onUpdate: _propTypes.default.func
};
ThreeDEditor.defaultProps = {
  boundaryConditions: {},
  isConventionalCellShown: false,
  onUpdate: undefined,
  editable: false
};