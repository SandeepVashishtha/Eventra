import Hero from './components/Hero';
import WhatsHappening from './components/WhatsHappening';
import Testimonials from './components/Testimonials';
import GitHubStats from './components/GitHubStats';
import Contributors from '../../components/Contributors';
import Community from './components/Community';

const HomePage = () => {
    return (
        <>
            <Hero />
            <WhatsHappening />
            <Testimonials />
            <GitHubStats />
            <Contributors />
            <Community />
        </>
    );
};

export default HomePage;
