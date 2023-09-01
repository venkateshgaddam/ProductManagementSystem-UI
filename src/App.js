import { Layout } from "antd";
import CustomHeader from './components/Header/Header';
import Products from "./components/Products/Products";
import './App.css';

const { Header, Content } = Layout;

function App() {
  return (
    <div className="App">
     <Layout>
            <Header>
              <CustomHeader />
            </Header>
            <Layout>
              <div id="content" className="content">
                <Content>
                  <Products />
                </Content>
              </div>
            </Layout>
          </Layout>
    </div>
  );
}

export default App;
