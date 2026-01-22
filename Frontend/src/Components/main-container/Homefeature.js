import React from "react";
import styles from './Home_feature.module.css';

  const Dummy_feature = [
    { id: 1, icon: 'fas fa-handshake', title: 'Real-Time Information Access', description: 'Stay updated with the latest insights, as our chatbot delivers current information instantly.' },
    { id: 2, icon: 'fas fa-magnifying-glass', title: 'Content Analysis', description: 'Analyze text, images, or social media posts with in-depth insights tailored to your needs.' },
    { id: 3, icon: 'fas fa-user-gear', title: 'Personalization', description: 'Enjoy responses customized to your preferences, making every interaction uniquely yours.' },
    { id: 4, icon: 'fas fa-list-check', title: 'Task Assistance', description: 'Get help with writing, coding, or planning—your chatbot is here to boost productivity.' },
    { id: 5, icon: 'fas fa-shield-halved', title: 'Privacy and Ethics Awareness', description: 'Trust in a chatbot that respects boundaries and prioritizes your privacy with care.' },
    { id: 6, icon: 'fas fa-layer-group', title: 'Scalability and Integration', description: 'Seamlessly integrate with tools and scale effortlessly to meet growing demands.' },
  ];

 
  

const Home_Feature = () => {

  
    return (
        <section className={styles['features-section']}>
            <div className={styles['feature-container']}>
                {/* Section Header */}
                <div className={styles['feature-header']}>
                    <h2>Our Amazing Features</h2>
                </div>

                {/* Feature Boxes */}
                {Dummy_feature.map((feature) => (
                    <div
                        key={feature.id}
                        className={styles['feature-box']}
                    >
                      <div className={styles['feature-icon']}>
                            <i className={feature.icon}></i>
                        </div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                  
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Home_Feature;