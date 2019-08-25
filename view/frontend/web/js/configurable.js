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
    'jquery/ui',
    'Magento_ConfigurableProduct/js/configurable'
], function($){

    $.widget('advance.configurable', $.mage.configurable, {
        /**
         * Callback which fired after gallery gets initialized.
         *
         * @param {HTMLElement} element - DOM element associated with gallery.
         */
        _onGalleryLoaded: function (element) {
            
            var galleryObject = element.data('gallery');

            this.options.mediaGalleryInitial = galleryObject.returnCurrentImages();
            this._changeProductImage();
        },
        _reloadPrice: function () {
            $(this.options.priceHolderSelector).trigger('updatePrice', this._getPrices());
            $("div[itemprop='sku']").html(this.options.spConfig.skus[this.simpleProduct]);
            
            let selector = "[attribute-code='hark_farbe_0";
                
            this.options.spConfig.colortitle[this.simpleProduct].forEach(function(item) {
                let code = _.keys(item) ? _.keys(item)[0] : false;

                if (!code || code.search("hark_farbtitel") == -1) {
                    return false;
                }

                let colorNumber = code.substring(code.length - 1, code.length),
                    $labelElement = $(selector + colorNumber + "']");

                if ($labelElement.length > 0) {
                    $labelElement.find("span").html(item[code]);
                }
            });

            this._updateEnergy(this);
        },

        _updateEnergy: function (widget) {
            let config = widget.options.jsonConfig,
                $wrapper = $('.energy-image-wrapper'),
                $energyIcon = $wrapper.find('.e-icon'),
                $energyPdf = $wrapper.find('.energy-pdf-link'),
                $energyImage = $wrapper.find('.e-image');

            this._updateEnergyValue(config.energyicon[widget.getProduct()], $energyIcon, 'src');
            this._updateEnergyValue(config.energypdf[widget.getProduct()], $energyPdf, 'href');
            this._updateEnergyValue(config.energyimage[widget.getProduct()], $energyImage, 'src');
        },

        _updateEnergyValue: function (configValue, element, attribute) {
            if (configValue) {
                element.removeClass('not-exist');
                element.attr(attribute, configValue);
            } else {
                element.addClass('not-exist');
            }
        }
    });

    return $.advance.configurable;
});
