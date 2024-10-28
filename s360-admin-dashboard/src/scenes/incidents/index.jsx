import React, { useState, useEffect } from 'react';
import { Table, Tooltip, Checkbox, Select, Typography, Pagination, Tag } from 'antd';
import { appConfig } from '../../appConfig';
import './App.css'; // Assuming you have a CSS file for styling

const { Title } = Typography;
const { Option } = Select;

const Incidents = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    id: [],
    subject: [],
    created_at: [],
    alert_generated_by: [],
    issue_category: [],
    msf_affected_regions: [],
    major_incident_type: [],
    caused_by_product: [],
    products_affected: [],
    caused_by_bu: [],
    affected_bu: [],
    quarter: [],
    year: [],
    month: [],
    ttd:  [],
    ttr: [],
    status_page_updated: []
  });

  const [searchInput, setSearchInput] = useState({
    id: '',
    subject: '',
    created_at: '',
    alert_generated_by: '',
    issue_category: '',
    msf_affected_regions: '',
    major_incident_type: '',
    caused_by_product: '',
    products_affected: '',
    caused_by_bu: '',
    affected_bu: '',
    quarter: '',
    year: '',
    month: '',
    ttd: '',
    ttr: '',
    status_page_updated: ''
  });

  useEffect(() => {
    fetch(`${appConfig.backend_Api_Url}/v2/getallincidentdetails`)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleFilterChange = (value, dataIndex) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [dataIndex]: value || [],
    }));
  };

  const handleSearchChange = (inputValue, dataIndex) => {
    setSearchInput(prevSearchInput => ({
      ...prevSearchInput,
      [dataIndex]: inputValue || '',
    }));
  };

  const renderSelectFilter = (dataIndex, options) => {
    const filteredOptions = options.filter(option => {
      // Ensure option is a string before applying toLowerCase, or convert it to string
      const optionStr = typeof option === 'string' ? option : String(option);
      return optionStr.toLowerCase().includes(searchInput[dataIndex]?.toLowerCase());
    });
  
    return (
      <>
        <div style={{ padding: 8 }}>
          <Checkbox
            onChange={(e) => {
              if (e.target.checked) {
                setFilters(prevFilters => ({
                  ...prevFilters,
                  [dataIndex]: filteredOptions,
                }));
              } else {
                setFilters(prevFilters => ({
                  ...prevFilters,
                  [dataIndex]: [],
                }));
              }
            }}
            checked={filteredOptions.length > 0 && filters[dataIndex].length === filteredOptions.length}
            indeterminate={filters[dataIndex].length > 0 && filters[dataIndex].length < filteredOptions.length}
          >
            Select All
          </Checkbox>
        </div>
        <Select
          mode="multiple"
          showSearch
          placeholder={`Filter by ${dataIndex}`}
          value={filters[dataIndex]}
          onSearch={(inputValue) => handleSearchChange(inputValue, dataIndex)}
          onChange={value => handleFilterChange(value, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
          allowClear
          filterOption={false}
        >
          {filteredOptions.map(option => {
            const optionStr = typeof option === 'string' ? option : String(option);
            return (
              <Option key={optionStr} value={optionStr}>
                {optionStr}
              </Option>
            );
          })}
        </Select>
      </>
    );
  };
  

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      
      render: (text) => {
        const extractedId = text?.match(/>([^<]*)</)?.[1];
        return (
          <a
            href={`https://lighthouse.freshservice.com/a/tickets/${extractedId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#ffffff', textDecoration: 'underline' }}
          >
            {extractedId}
          </a>
        );
      },
      filterDropdown: () => renderSelectFilter('id', [...new Set(data.map(item => item.id?.match(/>([^<]*)</)?.[1]))]),
      onFilter: (value, record) => filters.id.length === 0 || filters.id.some(filterValue => record.id?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.id.length ? filters.id : null,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',

      render: (subject) => (
        <Tooltip placement="topLeft" title={subject}>
          {subject}
        </Tooltip>
      ),
      filterDropdown: () => renderSelectFilter('subject', [...new Set(data.map(item => item.subject))]),
      onFilter: (value, record) => filters.subject.length === 0 || filters.subject.some(filterValue => record.subject?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.subject.length ? filters.subject : null,
    },
    
    {
      title: 'Issue Category',
      dataIndex: 'issue_category',
      key: 'issue_category',
      
      
      filterDropdown: () => renderSelectFilter('issue_category', [...new Set(data.map(item => item.issue_category))]),
      onFilter: (value, record) => filters.issue_category.length === 0 || filters.issue_category.some(filterValue => record.issue_category?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.issue_category.length ? filters.issue_category : null,
    },
    {
      title: 'MSF Affected Regions',
      dataIndex: 'msf_affected_regions',
      key: 'msf_affected_regions',
      
      
      filterDropdown: () => renderSelectFilter('msf_affected_regions', [...new Set(data.map(item => item.msf_affected_regions))]),
      onFilter: (value, record) => filters.msf_affected_regions.length === 0 || filters.msf_affected_regions.some(filterValue => record.msf_affected_regions?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.msf_affected_regions.length ? filters.msf_affected_regions : null,
    },
    {
      title: 'Major Incident Type',
      dataIndex: 'major_incident_type',
      key: 'major_incident_type',
      
      
      filterDropdown: () => renderSelectFilter('major_incident_type', [...new Set(data.map(item => item.major_incident_type))]),
      onFilter: (value, record) => filters.major_incident_type.length === 0 || filters.major_incident_type.some(filterValue => record.major_incident_type?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.major_incident_type.length ? filters.major_incident_type : null,
    },
    {
      title: 'Alert Generated By',
      dataIndex: 'alert_generated_by',
      key: 'alert_generated_by',
      
      
      filterDropdown: () => renderSelectFilter('alert_generated_by', [...new Set(data.map(item => item.alert_generated_by))]),
      onFilter: (value, record) => filters.alert_generated_by.length === 0 || filters.alert_generated_by.some(filterValue => record.alert_generated_by?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.alert_generated_by.length ? filters.alert_generated_by : null,
    },
    {
      title: 'Products Affected',
      dataIndex: 'products_affected',
      key: 'products_affected',
      
      filterDropdown: () => renderSelectFilter('products_affected', [...new Set(data.map(item => item.products_affected))]),
      onFilter: (value, record) => filters.products_affected.length === 0 || filters.products_affected.some(filterValue => record.products_affected?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.products_affected.length ? filters.products_affected : null,
    },
    {
      title: 'Caused By BU',
      dataIndex: 'caused_by_bu',
      key: 'caused_by_bu',
      
      
      filterDropdown: () => renderSelectFilter('caused_by_bu', [...new Set(data.map(item => item.caused_by_bu))]),
      onFilter: (value, record) => filters.caused_by_bu.length === 0 || filters.caused_by_bu.some(filterValue => record.caused_by_bu?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.caused_by_bu.length ? filters.caused_by_bu : null,
    },
    {
      title: 'Caused By Product',
      dataIndex: 'caused_by_product',
      key: 'caused_by_product',
      
      
      filterDropdown: () => renderSelectFilter('caused_by_product', [...new Set(data.map(item => item.caused_by_product))]),
      onFilter: (value, record) => filters.caused_by_product.length === 0 || filters.caused_by_product.some(filterValue => record.caused_by_product?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.caused_by_product.length ? filters.caused_by_product : null,
    },
    {
      title: 'Affected BU',
      dataIndex: 'affected_bu',
      key: 'affected_bu',
      
      
      filterDropdown: () => renderSelectFilter('affected_bu', [...new Set(data.map(item => item.affected_bu))]),
      onFilter: (value, record) => filters.affected_bu.length === 0 || filters.affected_bu.some(filterValue => record.affected_bu?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.affected_bu.length ? filters.affected_bu : null,
    },
    {
        title: 'Quarter',
        dataIndex: 'quarter',
        key: 'quarter',
        
        
        filterDropdown: () => renderSelectFilter('quarter', [...new Set(data.map(item => item.quarter))]),
        onFilter: (value, record) => filters.quarter.length === 0 || filters.quarter.some(filterValue => record.quarter?.toLowerCase().includes(filterValue.toLowerCase())),
        filteredValue: filters.quarter.length ? filters.quarter : null,
      },
      {
        title: 'Year',
        dataIndex: 'year',
        key: 'year',
        filterDropdown: () => renderSelectFilter('year', [...new Set(data.map(item => item.year))]),
        onFilter: (value, record) => filters.year.length === 0 || filters.year.some(filterValue => record.year?.toString().includes(filterValue)),
        filteredValue: filters.year.length ? filters.year : null,
      },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      
      
      filterDropdown: () => renderSelectFilter('month', [...new Set(data.map(item => item.month))]),
      onFilter: (value, record) => filters.month.length === 0 || filters.month.some(filterValue => record.month?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.month.length ? filters.month : null,
    },
    {
      title: 'TTD',
      dataIndex: 'ttd',
      key: 'ttd',
      filterDropdown: () => renderSelectFilter('ttd', [...new Set(data.map(item => item.ttd))]),
      onFilter: (value, record) => filters.ttd.length === 0 || filters.ttd.some(filterValue => record.ttd?.toString().includes(filterValue)),
      filteredValue: filters.ttd.length ? filters.ttd : null,
    },
    {
      title: 'TTR',
      dataIndex: 'ttr',
      key: 'ttr',
      filterDropdown: () => renderSelectFilter('ttr', [...new Set(data.map(item => item.ttr))]),
      onFilter: (value, record) => filters.ttr.length === 0 || filters.ttr.some(filterValue => record.ttr?.toString().includes(filterValue)),
      filteredValue: filters.ttr.length ? filters.ttr : null,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      
      
      filterDropdown: () => renderSelectFilter('created_at', [...new Set(data.map(item => item.created_at))]),
      onFilter: (value, record) => filters.created_at.length === 0 || filters.created_at.some(filterValue => record.created_at?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.created_at.length ? filters.created_at : null,
    },
    {
      title: 'Status Page Updated',
      dataIndex: 'status_page_updated',
      key: 'status_page_updated',
      
      
      filterDropdown: () => renderSelectFilter('status_page_updated', [...new Set(data.map(item => item.status_page_updated))]),
      onFilter: (value, record) => filters.status_page_updated.length === 0 || filters.status_page_updated.some(filterValue => record.status_page_updated?.toLowerCase().includes(filterValue.toLowerCase())),
      filteredValue: filters.status_page_updated.length ? filters.status_page_updated : null,
    },
    // Add other columns similarly with appropriate filter logic and null checks
  ];

  const filteredData = data.filter(incident => {
    return Object.keys(filters).every(key => {
      if (filters[key].length === 0) return true;
  
      return filters[key].some(filterValue => {
        const fieldValue = incident[key];
  
        // Handle numeric fields without lowercase conversion
        if (typeof fieldValue === 'number') {
          return fieldValue.toString().includes(filterValue);
        }
  
        // Handle string fields with lowercase conversion
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(filterValue.toLowerCase());
        }
  
        return false; // If fieldValue is neither string nor number
      });
    });
  });

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className='page-container'>
      <Title level={1} style={{ color: 'white', textAlign: 'left', width: '100%', zIndex: 1000, padding: '10px', margin: 0, top: '10px', position: 'fixed', flex: 1, display: 'flex' }}>Incidents</Title>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content', y: 'max-content' }}
        />
        <div className="record-count">
        <Tag color="black">Number of records: {filteredData.length}</Tag>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            onChange={handlePageChange}
            showSizeChanger
          />
        </div>
      </div>
    </div>
  );
};

export default Incidents;
