import Plugin from 'src/plugin/cookie/cookie-configuration.plugin';
import AjaxOffCanvas from 'src/plugin/offcanvas/ajax-offcanvas.plugin';
import CookieStorage from 'src/helper/storage/cookie-storage.helper';

/**
 * McsCookiePermission plugin
 * --------------------------
 * Extends default cookie-configuration.plugin
 *
 * Modifications:
 * 1. Open offCanvas configuration dialog when preference is not set
 * 2. Configure offCanvas to be not closable
 * 3. Add Button 'accept all'
 */
export default class McsCookiePermissionPlugin extends Plugin {

    /**
     * add accept-all-button selector to options
     */
    static options = {
        ...Plugin.options,
        buttonAcceptSelector: '.js-offcanvas-cookie-submit-all'
    }

    /**
     * extend init method
     * @inheritDoc
     */
    init() {
        super.init();

        // Open offCanvas cookie configuration dialog when preference is not set
        if (!this._isPreferenceSet()) {
            this.openOffCanvas();
        }
    }

    /**
     * Checks if a cookie preference is already set.
     * @private
     * @return boolean
     */
    _isPreferenceSet() {
        return !!CookieStorage.getItem(this.options.cookiePreference);
    }

    /**
     * Extend _registerOffCanvasEvents method
     * Add handler to accept-all-button
     * @private
     */
    _registerOffCanvasEvents() {
        super._registerOffCanvasEvents();

        const { submitEvent, buttonAcceptSelector } = this.options;
        const offCanvas = this._getOffCanvas();

        if (offCanvas) {
            const button = offCanvas.querySelector(buttonAcceptSelector);
            if (button) {
                button.addEventListener(submitEvent, this._handleAcceptAll.bind(this));
            }
        }
    }

    /**
     * Handler for accept-all-event
     * @private
     */
    _handleAcceptAll() {

        const { cookieSelector } = this.options;
        const offCanvas = this._getOffCanvas();

        // get all cookie checkboxes
        Array.from(offCanvas.querySelectorAll(cookieSelector)).forEach(checkbox => {
            // set checked and fire event (will also mark parent as checked)
            checkbox.checked = true;
            this._childCheckboxEvent(checkbox);
        });

        // save preference
        this._handleSubmit();

    }

    /**
     * Overwrite public method to open the offCanvas
     * Sets params position = 'modal' (custom) and closable = false
     * @param {function|null} callback
     */
    openOffCanvas(callback) {
        const url = window.router['frontend.cookie.offcanvas'];
        AjaxOffCanvas.open(url, false, this._onOffCanvasOpened.bind(this, callback), 'modal', false, undefined, true);
    }

}
