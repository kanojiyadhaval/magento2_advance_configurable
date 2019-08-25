<?php
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
namespace WebVision\AdvanceConfigurable\Plugin\Block\ConfigurableProduct\Product\View\Type;

use Magento\Framework\Json\EncoderInterface;
use Magento\Framework\Json\DecoderInterface;
use HarkShop\EnergyLabel\Helper\Data;
use HarkShop\Rewrite\Helper\ProductData;

class Configurable
{
    /**
     * @var EncoderInterface
     */
    protected $jsonEncoder;
    
    /**
     * @var DecoderInterface
     */
    protected $jsonDecoder;

    /**
     * @var Data
     */
    protected $energyHelper;

    /**
     * @var ProductData
     */
    protected $productDataHelper;
    
    /**
     * @param EncoderInterface $jsonEncoder
     * @param DecoderInterface $jsonDecoder
     * @param Data $energyHelper
     * @param ProductData $productDataHelper
     */
    public function __construct(
        EncoderInterface $jsonEncoder,
        DecoderInterface $jsonDecoder,
        Data $energyHelper,
        ProductData $productDataHelper
    ) {
        $this->jsonEncoder = $jsonEncoder;
        $this->jsonDecoder = $jsonDecoder;
        $this->energyHelper = $energyHelper;
        $this->productDataHelper = $productDataHelper;
    }
	
    /**
     * @param \Magento\ConfigurableProduct\Block\Product\View\Type\Configurable $subject
     * @param $result
     *
     * @return string
     */
    public function afterGetJsonConfig(
        \Magento\ConfigurableProduct\Block\Product\View\Type\Configurable $subject,
        $result
    ) {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $productId = $objectManager->get('Magento\Catalog\Model\Product')->getIdBySku($subject->getProduct()->getHarkBildNr());      
        $config = $this->jsonDecoder->decode($result);
        $defaultValues = array();
        
        foreach ($config['attributes'] as $attributeId => $attribute) {
            foreach ($attribute['options'] as $option) {
                if (!$productId) {
                    $productId = $option['products']['0'];
                }
                $optionId = $option['id'];
				
                if (in_array($productId, $option['products'])) {
                    $defaultValues[$attributeId] = $optionId;
                }
            }
        }
		
        foreach ($subject->getAllowProducts() as $simpleProduct) {
            $config['skus'][$simpleProduct->getId()] = $simpleProduct->getSku();
            $config['pname'][$simpleProduct->getId()] = $simpleProduct->getName();

            $attributes = array();

            for ($i = 1; $i <= 5; $i++) {
                $atCode = "hark_farbtitel_0" . $i;

                if (($atValue = $simpleProduct->getData($atCode)) ||
                    ($atValue = $subject->getProduct()->getData($atCode))) {
                    array_push($attributes, [$atCode => $atValue]);
                }
            }

            $productSimpleLoaded = $this->productDataHelper->getProductBySku($simpleProduct->getSku());

            $config['colortitle'][$simpleProduct->getId()] = $attributes;
            $config['energyicon'][$simpleProduct->getId()] = $this->energyHelper->getEnergyIcon($productSimpleLoaded);
            $config['energypdf'][$simpleProduct->getId()] = $this->energyHelper->getPdfUrl($productSimpleLoaded);
            $config['energyimage'][$simpleProduct->getId()] = $this->energyHelper->getProductEnergyImage($productSimpleLoaded);
        }
		
        $config['defaultValues'] = $defaultValues;
        $result = $this->jsonEncoder->encode($config);
		
        return $result;
    }
}
