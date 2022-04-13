/**
 * The Bluetooth server that the device is currently connected to.
 * @author Arnau Mora
 * @since 20220413
 * @private
 */
let btServer;

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
        cr($el, 'is-info', 'is-danger', 'is-success');
        st(
            $el,
            state === 0 ? 'Disconnected' : state === 1 ? 'Connecting' : 'Connected'
        );
        ca($el, state === 0 ? 'is-danger' : state === 1 ? 'is-info' : 'is-success');
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

    const bin2String = (array) => {
        let result = "";
        for (let i = 0; i < array.length; i++)
            result += String.fromCharCode(parseInt(array[i], 2));
        return result;
    }

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
                    const spaceAvailable = new DataView(value.buffer, value.byteOffset).getUint32(0, true);
                    console.log('Space available:', spaceAvailable);
                    st(_('files-avail'), humanFileSize(spaceAvailable));
                    break;
                case BluetoothUUID.getCharacteristic(BT_DAT_STORAGE_USED_UUID):
                    const spaceUsed = new DataView(value.buffer, value.byteOffset).getUint32(0, true);
                    console.log('Space used:', spaceUsed);

                    const filesUsed = _('files-used');
                    const filesUsage = _('files-spc');

                    st(filesUsed, humanFileSize(spaceUsed));
                    vs(filesUsage, spaceUsed);
                    cr(filesUsage, 'is-info', 'is-success', 'is-warning', 'is-danger');
                    ca(filesUsage, spaceUsed < 30 ? 'is-info' : spaceUsed < 50 ? 'is-success' : spaceUsed < 80 ? 'is-warning' : 'is-danger');

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
                        {services: [BT_SERVICE_DATA, BT_SERVICE_BATT]},
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
