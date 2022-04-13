/**
 * The ID of the bluetooth device to connect to.
 */
let btId;

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
    }

    // Check bluetooth compatibility
    if (navigator.bluetooth != null) {
        navigator.bluetooth
            .getAvailability()
            .then(available => {
                if (available)
                    cm(_('dim'), true);
                else
                    console.error('Bluetooth not available.');
            });
    } else return console.error('Navigator not compatible with Bluetooth.');

    elc(_('bt-conn'), async () => {
        if (btId != null)
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
                btId = server.device.id;
                localStorage.setItem('bt_id', btId);

                const service = await server.getPrimaryService(BT_SERVICE_DATA);
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    let value = char.properties.read ? await char.readValue() : null;
                    console.log('value:', value);

                    switch (char.uuid) {
                        case BluetoothUUID.getCharacteristic(BT_DATA_STORAGE_AVAILABLE_UUID):
                            const spaceAvailable = new DataView(value.buffer, value.byteOffset);
                            console.log('Space available:', spaceAvailable.getUint32(0, true));
                            break;
                        case BluetoothUUID.getCharacteristic(BT_DAT_STORAGE_USED_UUID):
                            const spaceUsed = new DataView(value.buffer, value.byteOffset);
                            console.log('Space used:', spaceUsed.getUint32(0, true));
                            break;
                        default:
                            console.log('Char:', char);
                            break;
                    }
                }

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
                setBtState(btState.DISCONNECTED);
            }
        } catch (e) {
            console.error('Could not perform bt operation. Error:', e);
            setBtState(btState.DISCONNECTED);
        }
    });

    setBtState(btState.DISCONNECTED);
    updateBatteryLevel(null);
});
