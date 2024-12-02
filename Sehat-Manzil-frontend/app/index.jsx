import { StatusBar } from 'expo-status-bar';
import SplashScreen from './SplashScreen'; // Import the new SplashScreen


export default function App() {
  
  console.log("App is running");
  
  return (
    <>
      <StatusBar backgroundColor="#2A2C38" style="light" />
      <SplashScreen/>
    </>
  );
}
