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

namespace WebVision\AdvanceConfigurable\Plugin\Block;

class ListProduct
{
    /**
     * @var ImageBuilder
     * @since 101.1.0
     */
    protected $imageBuilder;

     /**
     * @param Context $context
     * @param array $data
     */
    public function __construct(\Magento\Catalog\Block\Product\Context $context, array $data = [])
    {
        $this->imageBuilder = $context->getImageBuilder();
    }
	
	/**
     * @param \Magento\Catalog\Block\Product\AbstractProduct $subject
	 * @param \Closure $proceed
	 * @param \Magento\Catalog\Model\Product $product
     * @param $imageId
     * @param $attributes
	 *
     * @return object
     */
    public function aroundGetImage(
        \Magento\Catalog\Block\Product\AbstractProduct $subject,
        \Closure $proceed,
        \Magento\Catalog\Model\Product $product,
        $imageId,
        $attributes = []
    ) {
        $result = $proceed($product, $imageId, $attributes);
        $assocSku = $product->getHarkBildNr();
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
		
        if ($product->getTypeId() == 'configurable'){
            if ($assocSku){
                $stockState = $objectManager->get('Magento\CatalogInventory\Api\StockRegistryInterface');
                $defaultProd = $objectManager->get('Magento\Catalog\Model\Product')->getIdBySku($assocSku);
				
                if ($defaultProd) {
                    $childProduct = $objectManager->get('Magento\Catalog\Model\Product')->load($defaultProd);    
                    $stockData = $stockState->getStockItem($defaultProd);
					
                    if ($stockData['is_in_stock'] == 1 && $childProduct->getStatus() == 1){
                        return $this->imageBuilder->setProduct($childProduct)
                        ->setImageId($imageId)
                        ->setAttributes($attributes)
                        ->create();
                    }
                }
            } else {
                $productTypeInstance = $objectManager->get('Magento\ConfigurableProduct\Model\Product\Type\Configurable');
                $productAttributeOptions = $productTypeInstance->getUsedProductCollection($product);
                
                foreach ($productAttributeOptions as $simpleProduct) {
                    if ($simpleProduct['is_salable'] == 1) {
                        $defaultProd = $simpleProduct;
                        break;
                    }
                }
                $childProduct = $objectManager->get('Magento\Catalog\Model\Product')->load($defaultProd->getId());
                
                if ($childProduct->getId()) {
                    return $this->imageBuilder->setProduct($childProduct)
                        ->setImageId($imageId)
                        ->setAttributes($attributes)
                        ->create();
                }
            }
        }
		
        return $result;
    }
}
