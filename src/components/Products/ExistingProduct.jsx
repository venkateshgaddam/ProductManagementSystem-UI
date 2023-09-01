import { useState } from 'react';
import { categories, productsData } from '../../mockdata/products';
import { Button, Select, Card } from 'antd';
import './Products.css'

const { Meta } = Card
function ExistingProduct({categoryOptions, showProducts, setShowProducts}) {
    const [subCategoryOptionsState, setSubCategoryOptionsState] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState({})
    const handleCategory = (value) => {
        let tempSubCategory = []
        categories.map(cat => {
            if (cat.category === value) {
                tempSubCategory = cat.subCategories
            }
        });
        tempSubCategory.length > 0 && setSubCategoryOptionsState(tempSubCategory)
    }
    const handleSubmitClick = () => {
        setShowProducts(true);
    }
    const handleCardClick = (product) => {
        setSelectedProduct(product)
    }
    return (
        <div className="existing-product-details">
            <div className='categories-select'>
                    <div style={{ marginBottom: '10px' }}>
                        <Select
                            showSearch
                            placeholder='Enter Product Category'
                            style={{ width: 250 }}
                            onChange={handleCategory}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={categoryOptions.map((category) => ({ label: category, value: category }))}
                        />
                    </div>
                        <div>
                            <div style={{ margin: '10px 0px 10px 0px' }}>
                                <Select
                                    showSearch
                                    placeholder='Enter Sub-Product Category'
                                    style={{ width: 250 }}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={subCategoryOptionsState.map((subCategory) => ({ label: subCategory, value: subCategory }))}
                                />
                            </div>
                            <Button type='primary' onClick={handleSubmitClick}>Submit</Button>
                        </div>
                </div>
            {showProducts ?
                <div className='flex-container'>
                    {productsData.length > 0 && productsData.map(item =>
                        <Card
                            hoverable
                            style={{
                                width: 240,
                                margin: '10px'
                            }}
                            onClick={handleCardClick(item)}
                            cover={<img alt={item.productName} src={item.productImg} />}
                        >
                            <Meta title={item.subCategory} description={item.productDesc} />
                        </Card>
                        )}
                </div> : 
                ''
            }
            {selectedProduct !== null && Object.keys(selectedProduct).length > 0 ? '': ''}

        </div>
    )
}

export default ExistingProduct