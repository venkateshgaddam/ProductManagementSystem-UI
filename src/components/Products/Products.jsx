import { useState, useEffect } from 'react';
import axios from 'axios'
import { productsData as MockProductsData } from '../../mockdata/products'
import { Tabs, Space, Form, Input, Button, Upload, Select, Card, Modal, notification, Table, Spin } from 'antd';
import { UploadOutlined, EditOutlined } from '@ant-design/icons';
import './Products.css'

const { Meta } = Card
function Products() {
  const [form] = Form.useForm();
  const [categoryOptions, setCategoryOptions] = useState([])
  const [showProducts, setShowProducts] = useState(false);
  const [categories, setCategories] = useState([])
  const [subCategoryOptionsState, setSubCategoryOptionsState] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({})
  const [selectedFile, setSelectedFile] = useState();
  const [productsData, setProductsData] = useState([])
  const [showSpinner, setShowSpinner] = useState(false);
  const [imageUpdated, setImageUpdated] = useState(false)
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message, description) => {
    api[type]({
      message: message,
      description: description
    });
  };
  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'productName',
    },
    {
      title: 'Category',
      dataIndex: 'category',
    },
    {
      title: 'Sub Category',
      dataIndex: 'subcategory',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
    },
    {
      title: 'Description',
      dataIndex: 'productDescription',
    },
    {
      title: 'Image',
      dataIndex: 'productImage',
      render: (url) => <a target='_blank' href={url}>View Image</a>
    },
    {
      title: 'Actions',
      render: (data, record) => {
        return <EditOutlined onClick={() => setSelectedProduct(record)} />
      }
    }
  ]
  useEffect(() => {
    axios.get('https://18vhjce4w5.execute-api.us-east-1.amazonaws.com/Prod/api/Utility')
      .then((response) => {
        const categories = response.data
        const tempOptions = []
        categories.map(cat => tempOptions.push(cat.category));
        setCategories(categories)
        setCategoryOptions(tempOptions)
      }).catch((error) => openNotificationWithIcon('error', 'Error', 'Error fetching Category Details'))
  }, [])
  useEffect(() => {
    if (Object.keys(selectedProduct).length > 0) {
      form.setFieldsValue({
        category: selectedProduct?.category,
        subCategory: selectedProduct?.subcategory,
        Name: selectedProduct?.productName,
        Price: selectedProduct?.price,
        Quantity: selectedProduct?.quantity,
        Description: selectedProduct?.productDescription
      })
    }
  }, [selectedProduct])
  const handleCategory = (value) => {
    let tempSubCategory = []
    categories.map(cat => {
      if (cat.category === value) {
        tempSubCategory = cat.subCategories
      }
    });
    tempSubCategory.length > 0 && setSubCategoryOptionsState(tempSubCategory)
  }

  const handleFileUpload = (file, type) => {
    setSelectedFile(file.file);
    if (type === 'edit') {
      setImageUpdated(true)
    }
  }
  const handleModalForm = () => {
    const formValues = form.getFieldsValue();
    const tempProductsData = [...productsData]
    const selectedProductIndex = tempProductsData.findIndex(pd => pd.productId === selectedProduct?.productId);
    console.log('check index', selectedProductIndex);
    let formData = {};
    const formValuesKeys = Object.keys(formValues)
    formData = new FormData();
    if (imageUpdated) {
      formData.append('Image', selectedFile);
    } else {
      formData.append('Image', null);
    }
    formValuesKeys.length > 0 && formValuesKeys.map(item => formData.append([item], formValues[item]));
    formData.append('IsImageUpdated', imageUpdated);
    formData.append('ProductId', selectedProduct?.productId);
    formData.append('ProductCode', selectedProduct?.productCode);
    console.log('form values', formData, imageUpdated);
    axios.put(
      'https://18vhjce4w5.execute-api.us-east-1.amazonaws.com/Prod/api/Product',
      formData).then((response) => {
        openNotificationWithIcon('success', 'Success', 'Product Details Changes Saved Successfully');
        setSelectedProduct({});
        tempProductsData[selectedProductIndex] = response.data;
        setProductsData(tempProductsData)
      }).catch((error) => {
        openNotificationWithIcon('error', 'Error', 'Product Details Changes Failed');
        setSelectedProduct({})
      });
  }
  const onFinish = () => {
    const formValues = form.getFieldsValue();
    const formData = new FormData();
    formData.append('Image', selectedFile);
    const formValuesKeys = Object.keys(formValues)
    formValuesKeys.length > 0 && formValuesKeys.map(item => formData.append([item], formValues[item]))
    console.log('form values', formData.get('Name'), selectedFile);
    setShowSpinner(true)
    axios.post(
      'https://18vhjce4w5.execute-api.us-east-1.amazonaws.com/Prod/api/Product',
      formData).then((response) => {
        openNotificationWithIcon('success', 'Success', 'New Product Details Created Successfully');
        handleTabChange()
      }).catch((error) => {
        openNotificationWithIcon('error', 'Error', 'Product Creation Failed');
        handleTabChange()
      });
  }
  const handleSubmitSearchClick = () => {
    const searchFormValues = form.getFieldsValue();
    setShowSpinner(true)
    axios.get(
      `https://18vhjce4w5.execute-api.us-east-1.amazonaws.com/Prod/api/Product/Search/${searchFormValues.searchCategory}/${searchFormValues.searchSubCategory}`,
    ).then((response) => {
      console.log('check the response', response);
      setProductsData(response.data)
      // setProductsData(MockProductsData)
      setShowProducts(true);
      setShowSpinner(false)
    }).catch((error) => {
      openNotificationWithIcon('error', 'Error', 'Error retrieving Data');
      setShowSpinner(false)
    });
  }
  const formItemLayout = {
    labelCol: {
      span: 8,
    }
  };
  const items = [
    {
      key: '1',
      label: `New Product`,
      children: (
        <>
          <Form
            form={form}
            style={{ marginTop: '20px' }}
            layout="horizontal"
            preserve={false}
            onSubmitCapture={onFinish}
            {...formItemLayout}
            className="fileUploadForm"
          >
            <Form.Item
              label="Category"
              name="Category"
              rules={[
                {
                  required: true,
                  message: "Please enter Category!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder='Enter Product Category'
                style={{ width: 200 }}
                onChange={handleCategory}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={categoryOptions.map((category) => ({ label: category, value: category }))}
              />
            </Form.Item>
            <Form.Item
              label="Sub-Category"
              name="Subcategory"
              rules={[
                {
                  required: true,
                  message: "Please enter Sub-Category!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder='Enter Sub-Product Category'
                style={{ width: 200 }}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={subCategoryOptionsState.map((subCategory) => ({ label: subCategory, value: subCategory }))}
              />
            </Form.Item>
            <Form.Item
              label="Name"
              name="Name"
              rules={[
                {
                  required: true,
                  message: "Please enter Name!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Price"
              name="Price"
              rules={[
                {
                  required: true,
                  message: "Please enter Price!",
                },
              ]}
            >
              <Input type='number' />
            </Form.Item>
            <Form.Item
              label="Quantity"
              name="Quantity"
              rules={[
                {
                  required: true,
                  message: "Please enter Quantity!",
                },
              ]}
            >
              <Input type='number' />
            </Form.Item>
            <Form.Item
              label="Description"
              name="Description"
              rules={[
                {
                  required: true,
                  message: "Please enter Description!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Upload
              listType="picture"
              accept='jpeg,.png,.jpg'
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleFileUpload}
              className="upload-list-inline"
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
            <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              {contextHolder}
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          {showSpinner ? <Spin size='large' style={{ marginBottom: '20px' }} /> : ''}
        </>
      ),
    },
    {
      key: '2',
      label: `Existing Product`,
      children: (
        <div>
          {showSpinner ? <Spin size='large' /> : ''}
          <div className="existing-product-details">
            <Form
              form={form}
              style={{ marginTop: '20px' }}
              layout='inline'
              preserve={false}
              onSubmitCapture={() => handleSubmitSearchClick()}
            // {...formItemLayout}
            >
              <Form.Item
                label="Category"
                name="searchCategory"
                rules={[
                  {
                    required: true,
                    message: "Please enter Category!",
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder='Enter Product Category'
                  style={{ width: 200 }}
                  onChange={handleCategory}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={categoryOptions.map((category) => ({ label: category, value: category }))}
                />
              </Form.Item>
              <Form.Item
                label="Sub-Category"
                name="searchSubCategory"
                rules={[
                  {
                    required: true,
                    message: "Please enter Sub-Category!",
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder='Enter Sub-Product Category'
                  style={{ width: 200 }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={subCategoryOptionsState.map((subCategory) => ({ label: subCategory, value: subCategory }))}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Search
                </Button>
              </Form.Item>
            </Form>
            {showProducts ?
              <div style={{ marginTop: '20px' }}>
                <Table columns={tableColumns} dataSource={productsData}
                  pagination={false} bordered={true}
                  rowClassName={(record) => {
                    if (record.quantity < 10) {
                      return 'red-row'
                    } else if (record.quantity >= 10 && record.quantity < 100) {
                      return 'orange-row'
                    }
                    else {
                      return 'green-row'
                    }
                  }
                  } />
              </div> :
              ''
            }
            <Modal title="Basic Modal" open={Object.keys(selectedProduct).length > 0}
              onOk={handleModalForm}
              onCancel={() => { setSelectedProduct({}) }}>
              <Form
                form={form}
                style={{ marginTop: '20px' }}
                layout="horizontal"
                preserve={false}
                initialValues={{
                  Category: selectedProduct?.category,
                  Subcategory: selectedProduct?.subcategory,
                  Name: selectedProduct?.productName,
                  Price: selectedProduct?.price,
                  Quantity: selectedProduct?.quantity,
                  Description: selectedProduct?.productDescription
                }}
                {...formItemLayout}
              >
                <Form.Item
                  label="Category"
                  name="Category"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Category!",
                    },
                  ]}
                >
                  <Input disabled={true} />
                </Form.Item>
                <Form.Item
                  label="Sub-Category"
                  name="Subcategory"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Sub-Category!",
                    },
                  ]}
                >
                  <Input disabled={true} />
                </Form.Item>
                <Form.Item
                  label="Name"
                  name="Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Name!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Price"
                  name="Price"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Price!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Quantity"
                  name="Quantity"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Quantity!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Description"
                  name="Description"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Description!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Upload
                  listType="picture"
                  accept='.jpeg,.png,.jpg'
                  maxCount={1}
                  onChange={(file) => handleFileUpload(file, 'edit')}
                  beforeUpload={() => false}
                  className="upload-list-inline"
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form>
            </Modal>
          </div>
        </div>
      ),
    },
  ];
  function handleTabChange(e) {
    form.resetFields();
    setShowProducts(false);
    setSelectedProduct({});
    setShowSpinner(false)
    setSelectedFile('');
    setImageUpdated(false)
    setSubCategoryOptionsState([])
  }

  return (
    <>
      <div
        className='tabs-view'
        style={{
          width: "100%",
          margin: "auto",
          textAlign: "center",
          paddingTop: "30px",
        }}
      >
        <Space className="space-layout">
          <Tabs
            centered
            defaultActiveKey="1"
            items={items}
            onChange={(e) => handleTabChange(e)} />

        </Space>
      </div>
    </>
  );
}

export default Products