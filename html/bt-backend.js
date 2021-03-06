/**
 * The Bluetooth server that the device is currently connected to.
 * @author Arnau Mora
 * @since 20220413
 * @private
 */
let btServer;

let spaceUsed, spaceAvailable;

let deviceModel, deviceRevision, deviceManufacturer;

/**
 * Stores if the currently connected device supports file transferring.
 * @author Arnau Mora
 * @since 20220421
 * @type {boolean}
 */
let ftCompatible;

/**
 * Determines the current connection state of the Bluetooth service.
 * @author Arnau Mora
 * @since 22020413
 * @readonly
 * @enum {number}
 * @type {{DISCONNECTED: number, CONNECTED: number, CONNECTING: number}}
 */
const btState = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
};

/**
 * The GATT service for requesting user data.
 * @author Arnau Mora
 * @since 20220413
 * @type {number}
 */
const BT_SERVICE_DATA = 0x181C;

/**
 * The GATT service for requesting battery info.
 * @author Arnau Mora
 * @since 20220413
 * @type {number}
 */
const BT_SERVICE_BATT = 0x180F;

/**
 * The GATT service for requesting system info.
 * @author Arnau Mora
 * @since 20220421
 * @type {number}
 */
const BT_SERVICE_INFO = 0x180A;

/**
 * The UUID of the characteristic that shows the model of the device.
 * @author Arnau Mora
 * @since 20220421
 * @type {number}
 */
const BT_INFO_MODEL = 0x2A24;

/**
 * The UUID of the characteristic that shows the revision of the firmware installed of the device.
 * @author Arnau Mora
 * @since 20220421
 * @type {number}
 */
const BT_INFO_REVISION = 0x2A26;

/**
 * The UUID of the characteristic that shows the manufacturer name of the device.
 * @author Arnau Mora
 * @since 20220421
 * @type {number}
 */
const BT_INFO_MANUFACTURER = 0x2A29;

/**
 * The UUID of the characteristic that tells whether some functions are compatible or not. The bits used for checking
 * based on its index are:
 * * `1`: File transfer compatibility
 * @author Arnau Mora
 * @since 20220421
 * @type {string}
 * @see {BT_SERVICE_INFO}
 */
const BT_INFO_COMPATIBILITY_TABLE = 'e978c8fd-bb34-6bb1-ca49-2565696b18b1';

/**
 * The UUID of the available storage characteristic.
 * @author Arnau Mora
 * @since 20220413
 * @type {number}
 * @see {BT_SERVICE_DATA}
 */
const BT_DATA_STORAGE_AVAILABLE_UUID = 0x2B98;

/**
 * The UUID of the used storage characteristic.
 * @author Arnau Mora
 * @since 20220413
 * @type {number}
 * @see {BT_SERVICE_DATA}
 */
const BT_DAT_STORAGE_USED_UUID = 0x2B99;

/**
 * The UUID of the files list characteristic.
 * @author Arnau Mora
 * @since 20220413
 * @type {number}
 * @see {BT_SERVICE_DATA}
 */
const BT_DATA_STORAGE_LIST_UUID = 0x2ACB;

/**
 * The UUID of the battery level characteristic.
 * @author Arnau Mora
 * @since 20220413
 * @type {number}
 * @see {BT_SERVICE_BATT}
 */
const BT_BATT_LEVEL_UUID = 0x2A19;

dell(() => {
    /**
     * Sets the current state display of the Bluetooth connection.
     * @author Arnau Mora
     * @since 20220413
     * @param {btState} state 0 for disconnected, 1 for connecting, 2 for connected.
     */
    const setBtState = (state) => {
        const $el = _('bt-state');
        const $crd = _('nc-card');
        const $dinfo = _('dibi');
        cr($el, 'is-info', 'is-danger', 'is-success');
        st(
            $el,
            state === 0 ? 'Disconnected' : state === 1 ? 'Connecting' : 'Connected'
        );
        ca($el, state === 0 ? 'is-danger' : state === 1 ? 'is-info' : 'is-success');

        cs($crd, 'is-hidden', state === btState.DISCONNECTED);
        cs($dinfo, 'is-hidden', state === btState.CONNECTED);
    };

    /**
     * Updates the GUI with the current device's battery level.
     * @param {number|null} level
     */
    const updateBatteryLevel = (level) => {
        const battLevel = _('batt-level');
        const battStateIcon = _('batt-state');

        if (!level) {
            st(battLevel, '');
            st(battStateIcon, 'battery_unknown');
        } else {
            st(battLevel, `${level}%`);
            st(battStateIcon,
                level < (100 / 7) ? 'battery_0_bar' : level < (100 / 7 * 2) ? 'battery_1_bar' :
                    level < (100 / 7 * 3) ? 'battery_2_bar' : level < (100 / 7 * 4) ? 'battery_3_bar' :
                        level < (100 / 7 * 5) ? 'battery_4_bar' : level < 100 ? 'battery_6_bar' : 'battery_full'
            );
        }
    };

    const updateSpace = () => {
        if (spaceAvailable != null) {
            const filesAvailable = _('files-avail');

            st(filesAvailable, humanFileSize(spaceAvailable));
        }

        if (spaceUsed != null) {
            const filesUsed = _('files-used');
            const filesUsage = _('files-spc');

            st(filesUsed, humanFileSize(spaceUsed));

            if (spaceAvailable != null && spaceUsed != null) {
                const usedPercent = spaceUsed / spaceAvailable;
                vs(filesUsage, usedPercent * 100);
                cr(filesUsage, 'is-info', 'is-success', 'is-warning', 'is-danger');
                ca(filesUsage, usedPercent < .3 ? 'is-info' : usedPercent < .5 ? 'is-success' : usedPercent < .8 ? 'is-warning' : 'is-danger');
            }
        }
    };

    const updateUsedSpace = async () => {
        if (btServer == null) {
            console.error('Could not update device\'s used space: Not connected');
            return;
        }

        if (!btServer.connected)
            await btServer.device.gatt.connect();

        if (!btServer.connected) {
            console.error('Could not connect to the Bluetooth server.');
            return;
        }

        const service = await btServer.getPrimaryService(BT_SERVICE_DATA);
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
            let value = char.properties.read ? await char.readValue() : null;

            switch (char.uuid) {
                case BluetoothUUID.getCharacteristic(BT_DATA_STORAGE_AVAILABLE_UUID):
                    spaceAvailable = new DataView(value.buffer, value.byteOffset).getUint32(0, true);
                    console.log('Space available:', spaceAvailable);
                    updateSpace()
                    break;
                case BluetoothUUID.getCharacteristic(BT_DAT_STORAGE_USED_UUID):
                    spaceUsed = new DataView(value.buffer, value.byteOffset).getUint32(0, true);
                    console.log('Space used:', spaceUsed);
                    updateSpace()
                    break;
                case BluetoothUUID.getCharacteristic(BT_DATA_STORAGE_LIST_UUID):
                    const buffer = new Uint8Array(value.buffer);
                    let filesListRaw = [];
                    let reachedCR = false;
                    let hexBuilder = [];
                    for (let c = 0; c < buffer.length; c++) {
                        if (reachedCR)
                            hexBuilder.push(buffer[c] - 32);
                        else
                            filesListRaw += buffer[c] !== 0 ? String.fromCharCode(reachedCR ? 32 - buffer[c] : buffer[c]) : '';

                        if (buffer[c] === 10) {
                            const sizeStr = zeroPad(hexBuilder[3], 2) + zeroPad(hexBuilder[2], 2) + zeroPad(hexBuilder[1], 2) + zeroPad(hexBuilder[0], 2);
                            filesListRaw += Number('0x' + sizeStr) + '\n';
                            reachedCR = false;
                        } else if (buffer[c] === 13) {
                            reachedCR = true;
                            hexBuilder = [];
                        }
                    }
                    filesListRaw = filesListRaw
                        .trimEnd()
                        .split('\n');

                    let filesList = [];
                    filesListRaw.forEach((i) => {
                        const split = i.splitAt(i.indexOf('\r'));
                        if (split[0].length > 0) {
                            // console.warn('Size:', split[1]);
                            filesList.push({name: split[0], size: split[1]})
                        }
                    });
                    console.log('Files list:', filesList);

                    await loadFiles(filesList);

                    break;
                default:
                    console.log('Char:', char);
                    console.log('Value:', value);
                    break;
            }
        }
    };

    _('flm').addEventListener('modal_open', (ev) => {
        if (btServer == null || !btServer.connected) {
            ev.preventDefault();
            snackbar('Not connected');
        }
    });

    elc(_('bt-card-conn'), (ev) => {
        ev.preventDefault();

        _('bt-state').click();
    });

    // Check bluetooth compatibility
    try {
        navigator.bluetooth
            .getAvailability()
            .then(available => {
                if (available)
                    cm(_('dim'), true);
                else {
                    const userAgent = navigator.userAgent;
                    const chromeIndex = userAgent.indexOf('Chrome/');
                    if (chromeIndex >= 0) {
                        const versionStr = userAgent.substring(chromeIndex + 7, userAgent.indexOf('.', chromeIndex));
                        if (versionStr.length > 0) {
                            const version = parseInt(versionStr);
                            if (version >= 85) {
                                sh(_('bt-reason'), 'It\'s required that you enable Bluetooth compatibility on this device. Please, access Chrome flags at <a href="chrome://flags">chrome://flags</a> and enable <code>#enable-web-bluetooth-new-permissions-backend</code> and <code>#enable-experimental-web-platform-features</code>. Then, refresh this page.');
                                return console.error('Chrome flag needs to be enabled.');
                            }
                        }
                    }

                    console.error('Bluetooth not available.');
                    st(_('bt-reason'), 'Bluetooth service is not available');
                }
            });
    } catch (e) {
        sh(_('bt-reason'), 'Browser is not compatible with Bluetooth. Check the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#browser_compatibility">Browser Compatibility Table</a>, and choose another one depending on your platform.');
        return console.error('Navigator not compatible with Bluetooth.');
    }

    elc(_('bt-conn'), async () => {
        if (btServer != null || btServer?.connected)
            return;

        setBtState(btState.CONNECTING);
        try {
            const device = await navigator.bluetooth
                .requestDevice({
                    filters: [
                        {services: [BT_SERVICE_DATA, BT_SERVICE_BATT, BT_SERVICE_INFO]},
                        {namePrefix: 'EMS_PROTO'}
                    ],
                });
            const server = await device.gatt.connect();

            if (server.connected) {
                console.log('Connected successfully');
                setBtState(btState.CONNECTED);
                btServer = server;

                await updateUsedSpace();

                const battService = await server.getPrimaryService(BT_SERVICE_BATT);
                const battChars = await battService.getCharacteristics();
                for (const char of battChars) {
                    /**
                     * @type {{buffer:ArrayBuffer,byteOffset:number}|null}
                     */
                    let value = char.properties.read ? await char.readValue() : null;
                    console.log('value:', value);

                    switch (char.uuid) {
                        case BluetoothUUID.getCharacteristic(BT_BATT_LEVEL_UUID):
                            const batteryLevelView = new DataView(value.buffer, value.byteOffset);
                            const batteryLevel = batteryLevelView.getUint8(0);
                            console.log('Battery level:', batteryLevel);

                            updateBatteryLevel(batteryLevel);
                            break;
                        default:
                            console.log('Battery char:', char);
                            break;
                    }
                }

                const infoService = await server.getPrimaryService(BT_SERVICE_INFO);
                const infoChars = await infoService.getCharacteristics();
                for (const char of infoChars) {
                    /**
                     * @type {{buffer:ArrayBuffer,byteOffset:number}|null}
                     */
                    let value = char.properties.read ? await char.readValue() : null;
                    const buffer = new Uint8Array(value.buffer);
                    const dataView = new DataView(value.buffer, value.byteOffset);
                    const dataValue = dataView.getUint8(0);

                    let str = '';
                    buffer.forEach((i) => str += String.fromCharCode(i));

                    switch (char.uuid) {
                        case BT_INFO_COMPATIBILITY_TABLE:
                            ftCompatible = isBitOn(dataValue, 7); // 1XXXXXXX determines file transfer compatible

                            console.log('File transfer compatible:', ftCompatible);

                            break;
                        case BluetoothUUID.getCharacteristic(BT_INFO_MODEL):
                            deviceModel = str;

                            break;
                        case BluetoothUUID.getCharacteristic(BT_INFO_REVISION):
                            deviceRevision = buffer[0] + '.' + buffer[1] + '.' + buffer[2] + (buffer[3] === 1 ? '-dev' : '');

                            break;
                        case BluetoothUUID.getCharacteristic(BT_INFO_MANUFACTURER):
                            deviceManufacturer = str;

                            break;
                        default:
                            console.log('Device info char:', char);
                            console.log('value:', value);
                            break;
                    }
                }

                console.log(
                    'Model:', deviceModel + '\n' +
                    'Revision:', deviceRevision + '\n' +
                    'Manufacturer:', deviceManufacturer
                );

                st(_('mnf'), deviceModel);
                st(_('fvf'), deviceRevision);
                st(_('mfnf'), deviceManufacturer);
                st(_('ftc'), ftCompatible ? 'true' : 'false');
            } else {
                console.error('There was an error while connecting.');
                snackbar('Could not connect. More info in the console.');
                setBtState(btState.DISCONNECTED);
            }
        } catch (e) {
            console.error('Could not perform bt operation. Error:', e);
            snackbar('Could not connect. More info in the console.');
            setBtState(btState.DISCONNECTED);
        }
    });

    setBtState(btState.DISCONNECTED);
    updateBatteryLevel(null);
});
