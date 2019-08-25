/**
 * web-vision GmbH
 *
 * NOTICE OF LICENSE
 *
 * <!--LICENSETEXT-->
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.web-vision.de for more information.
 *
 * @category    WebVision
 * @package     HarkShop/NavigationMenu
 * @copyright   Copyright (c) 2001-2019 web-vision GmbH (http://www.web-vision.de)
 * @license     <!--LICENSEURL-->
 * @author      Dhaval Kanojiya <dhaval@web-vision.de>
*/

define([
    'jquery',
    'Magento_ConfigurableProduct/js/options-updater',
    'jquery/ui'
], function ($, Updater) {
    'use strict';

    $.widget('mage.selectSwatch', {
        options: {
            swatchOptions: null,
            selectors: {
                formSelector: '#product_addtocart_form',
                swatchSelector: '.swatch-opt'
            },
            swatchWidgetName: 'mageSwatchRenderer',
            widgetInitEvent: 'swatch.initialized',
            clickEventName: 'emulateClick'
        },

        /**
         * Widget initialisation.
         * Configurable product options updater listens to selected swatch options
         */
        _init: function () {
            var updater;
            this.selectDefaultSwatchOptions(this);
            updater = new Updater(this.options.widgetInitEvent, this.selectDefaultSwatchOptions.bind(this));
            updater.listen();
        },

        /**
         * Sets default configurable swatch attribute's selected
         */
        selectDefaultSwatchOptions: function () {
            var swatchWidget = $(this.options.selectors.swatchSelector).data(this.options.swatchWidgetName);

            if (!swatchWidget || !swatchWidget._EmulateSelectedByAttributeId) {
                return;
            }
            swatchWidget._EmulateSelectedByAttributeId(
                this.options.swatchOptions.defaultValues, this.options.clickEventName
            );
            swatchWidget._OnClick($(this), swatchWidget);
        }
    });

    return $.mage.selectSwatch;
});
