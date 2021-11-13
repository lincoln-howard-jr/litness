import Auth from './components/Auth';
import DropPin from './components/DropPin';
import Friends from './components/Friends';
import ListView from './components/ListView';
import Log from './components/Log';
import Map from './components/Map';

function App() {
  return (
    <>
      <Auth />
      <ListView />
      <DropPin />
      <Map />
      <Log />
      <Friends />
    </>
  );
}

export default App;
