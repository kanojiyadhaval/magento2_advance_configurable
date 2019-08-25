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

var config = {
    map: {
        '*': {
            'Magento_Swatches/js/configurable-customer-data': 'WebVision_AdvanceConfigurable/js/configurable-customer-data',
            configurable: 'WebVision_AdvanceConfigurable/js/configurable'
        }
    },
    config: {
        mixins: {
            'Magento_Swatches/js/swatch-renderer': {
                'WebVision_AdvanceConfigurable/js/mixin': true
            }
        }
    }
};