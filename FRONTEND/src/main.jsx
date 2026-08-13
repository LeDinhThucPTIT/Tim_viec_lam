import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import App from './App';
import './assets/styles/global.css';

const theme = {
  token: {
    colorPrimary: '#00b14f',
    colorPrimaryHover: '#009140',
    colorLink: '#00b14f',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    borderRadius: 8,
    colorBgContainer: '#ffffff',
  },
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider locale={viVN} theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
