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
        buttonAcceptSelector: '.js-offcanvas-cookie-submit-all',
        buttonDenySelector: '.js-offcanvas-cookie-deny',
    }

    /**
     * extend init method
     * @inheritDoc
     */
    init() {
        super.init();

        this._onCloseRegistered = false;

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

        const { submitEvent, buttonAcceptSelector, buttonDenySelector } = this.options;
        const offCanvas = this._getOffCanvas();

        if (offCanvas) {
            const buttonAcceptAll = offCanvas.querySelector(buttonAcceptSelector);
            if (buttonAcceptAll) {
                buttonAcceptAll.addEventListener(submitEvent, this._handleAcceptAll.bind(this));
            }
            const buttonDeny = offCanvas.querySelector(buttonDenySelector);
            if (buttonDeny) {
                buttonDeny.addEventListener(submitEvent, this._handleDeny.bind(this))
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

    _handleDeny(event) {
        event.preventDefault();

        const { cookiePreference } = this.options;
        this.closeOffCanvas();
        CookieStorage.setItem(cookiePreference, '1', '30');

        this.$emitter.publish('onClickDenyButton');
    }

    /**
     * Overwrite public method to open the offCanvas
     * Sets params position = 'modal' (custom) and closable = false
     * @param {function|null} callback
     */
    openOffCanvas(callback) {
        const url = window.router['frontend.cookie.offcanvas'];
        AjaxOffCanvas.open(url, false, this._onOffCanvasOpened.bind(this, callback), 'modal', false, undefined, true);

        if (!this._onCloseRegistered) {
            document.$emitter.subscribe('onCloseOffcanvas', this._onOffCanvasClose.bind(this));
            this._onCloseRegistered = true;
        }
    }

    /**
     * Check if preference when our OffCanvas was closed
     * @private
     */
    _onOffCanvasClose() {

        if (!this._isPreferenceSet()) {

            /**
             * Cookie modal was closed, but preference is not set.
             * This may happen when resizing browser window, as _onViewportHasChanged() will call OffCanvas.close()
             * under certain conditions in
             * platform/src/Storefront/Resources/app/storefront/src/plugin/header/account-menu.plugin.js
             */

            // re-open modal after 100 ms
            window.setTimeout(this.openOffCanvas.bind(this), 100);

        } else {

            // all good, remove event listener
            document.$emitter.unsubscribe('onCloseOffcanvas', this._onOffCanvasClose.bind(this));
            this._onCloseRegistered = false;

        }

    }

}
