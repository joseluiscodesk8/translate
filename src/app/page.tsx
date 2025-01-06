import { NextPage } from "next";
import dynamic from "next/dynamic";

const DynamicAudio = dynamic(() => import('./components/AudioCapture'));

const Home: NextPage = () => {
  return (
    <>
      <DynamicAudio />
    </>
  )
}
export default Home;