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
    'jquery'
], function ($) {
    'use strict';

    return function (widget) {

        $.widget('mage.SwatchRenderer', widget, {
            _init: function () {
                if (_.isEmpty(this.options.jsonConfig.images)) {
                    this.options.useAjax = true;
                    // creates debounced variant of _LoadProductMedia()
                    // to use it in events handlers instead of _LoadProductMedia()
                    this._debouncedLoadProductMedia = _.debounce(this._LoadProductMedia.bind(this), 500);
                }

                if (this.options.jsonConfig !== '' && this.options.jsonSwatchConfig !== '') {
                    // store unsorted attributes
                    this.options.jsonConfig.mappedAttributes = _.clone(this.options.jsonConfig.attributes);
                    this._sortAttributes();
                    this._RenderControls();

                    //this is additional code for select default attribute value
                    this._EmulateSelectedByAttributeId(
                        this.options.jsonConfig.defaultValues, 'click'
                    );

                    this._setPreSelectedGallery();
                    $(this.element).trigger('swatch.initialized');
                } else {
                    console.log('SwatchRenderer: No input data received');
                }
				
                this.options.tierPriceTemplate = $(this.options.tierPriceTemplateSelector).html();
            },

            _OnClick: function ($this, $widget, eventName) {
                var $parent = $this.parents('.' + $widget.options.classes.attributeClass),
                    $wrapper = $this.parents('.' + $widget.options.classes.attributeOptionsWrapper),
                    $label = $parent.find('.' + $widget.options.classes.attributeSelectedOptionLabelClass),
                    attributeId = $parent.attr('attribute-id'),
                    $input = $parent.find('.' + $widget.options.classes.attributeInput);

                if ($widget.inProductList) {
                    $input = $widget.productForm.find(
                        '.' + $widget.options.classes.attributeInput + '[name="super_attribute[' + attributeId + ']"]'
                    );
                }

                if ($this.hasClass('disabled')) {
                    return;
                }

                if ($this.hasClass('selected')) {
                    $parent.removeAttr('option-selected').find('.selected').removeClass('selected');
                    $input.val('');
                    $label.text('');
                    $this.attr('aria-checked', false);
                } else {
                    $parent.attr('option-selected', $this.attr('option-id')).find('.selected').removeClass('selected');
                    $label.text($this.attr('option-label'));
                    $input.val($this.attr('option-id'));
                    $input.attr('data-attr-name', this._getAttributeCodeById(attributeId));
                    $this.addClass('selected');
                    $widget._toggleCheckedAttributes($this, $wrapper);
                }

                $widget._Rebuild();
                $("div[itemprop='sku']").html(this.options.jsonConfig.skus[this.getProduct()]);
                $("span[itemprop='name']").html(this.options.jsonConfig.pname[this.getProduct()]);
                $widget._updateEnergy($widget);

                this.options.jsonConfig.colortitle[this.getProduct()].forEach(function(item) {
                    let code = _.keys(item) ? _.keys(item)[0] : false;

                    if (!code || code.search("hark_farbtitel") == -1) {
                        return false;
                    }

                    let colorNumber = code.substring(code.length - 1, code.length);

                    let $labelElement = $(`additional-attribute-label.hark_farbe_0${colorNumber}, [attribute-code='hark_farbe_0${colorNumber}'] span`);

                    if ($labelElement.length > 0) {
                        $labelElement.html(item[code]);
                    }
                });
                				
                if ($widget.element.parents($widget.options.selectorProduct)
                        .find(this.options.selectorProductPrice).is(':data(mage-priceBox)')
                ) {
                    $widget._UpdatePrice();
                }

                $widget._loadMedia(eventName);
                $input.trigger('change');
            },

            /**
            * Start update base image process based on event name
            * @param {Array} images
            * @param {jQuery} context
            * @param {Boolean} isInProductView
            * @param {String|undefined} eventName
            */
            updateBaseImage: function (images, context, isInProductView, eventName) {
                var gallery = context.find(this.options.mediaGallerySelector).data('gallery');

                // Check if gallery is defined.
                if (eventName === undefined && isInProductView === false) {
                    this.processUpdateBaseImage(images, context, isInProductView, gallery);
                } else if (gallery === undefined && isInProductView === true) {
                    context.find(this.options.mediaGallerySelector).on('gallery:loaded', function (loadedGallery) {
                        loadedGallery = context.find(this.options.mediaGallerySelector).data('gallery');
                        this.processUpdateBaseImage(images, context, isInProductView, loadedGallery);
                    }.bind(this));
                } else {
                    this.processUpdateBaseImage(images, context, isInProductView, gallery);
                }
            },

            processUpdateBaseImage: function (images, context, isInProductView, gallery) {
                var justAnImage = images[0],
                    initialImages = this.options.mediaGalleryInitial,
                    imagesToUpdate,
                    isInitial;

                if (isInProductView) {
                    imagesToUpdate = images.length ? this._setImageType($.extend(true, [], images)) : [];
                    isInitial = _.isEqual(imagesToUpdate, initialImages);

                    if (this.options.gallerySwitchStrategy === 'prepend' && !isInitial) {
                        imagesToUpdate = imagesToUpdate.concat(initialImages);
                    }

                    imagesToUpdate = this._setImageIndex(imagesToUpdate);
                    gallery.updateData(imagesToUpdate);

                    if (isInitial) {
                        $(this.options.mediaGallerySelector).AddFotoramaVideoEvents();
                    } else {
                        $(this.options.mediaGallerySelector).AddFotoramaVideoEvents({
                            selectedOption: this.getProduct(),
                            dataMergeStrategy: this.options.gallerySwitchStrategy
                        });
                    }

                    gallery.first();
                } else if (justAnImage && justAnImage.img) {
                    context.find('.product-image-photo').attr('src', justAnImage.img);
                }
                
                $("div[itemprop='sku']").html(this.options.jsonConfig.skus[this.getProduct()]);
                $("span[itemprop='name']").html(this.options.jsonConfig.pname[this.getProduct()]);
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
                let $wrapper = $('.energy-image-wrapper'),
                    $energyImageWrapper = $wrapper.find('.energy-image-detail');

                if (configValue) {
                    element.removeClass('not-exist');
                    element.attr(attribute, configValue);

                    if (element.hasClass('e-image')) {
                        $energyImageWrapper.removeClass('not-exist');
                    }
                } else {
                    element.addClass('not-exist');

                    if (element.hasClass('e-image')) {
                        $energyImageWrapper.addClass('not-exist');
                    }
                }
            }
        });

        return $.mage.SwatchRenderer;
    }
});