import React, { useState } from 'react';
import styles from './Widgets.module.css';
import images from '../../assets/images';
import Navbar from '../head/Navbar';
import Footer from '../footer/Footer';

const widgets = [
  {
    id: 1,
    title: 'Accelerate time to resolution',
    icon: '😊',
    image: 'widgetImg',
    content: 'Speed up issue handling with clear processes and smart automation.'
  },
  {
    id: 2,
    title: 'Build your source of truth',
    icon: '🧭',
    image: 'widgetImg2',
    content: 'Centralize all your information for teams and customers.'
  },
  {
    id: 3,
    title: 'Better conversations every time',
    icon: '🧍‍♂️',
    image: 'widgetImg3',
    content: 'Help teams deliver consistent, personalized experiences.'
  },
  {
    id: 4,
    title: 'Powerful collaboration tools',
    icon: '🔧',
    image: 'widgetImg4',
    content: 'Connect departments and streamline workflows with ease.'
  }
];

export default function Widgets() {
  const [active, setActive] = useState(widgets[0]);
  const [openId, setOpenId] = useState(widgets[0].id);

  const handleClick = (widget) => {
    setActive(widget);
    setOpenId(prev => prev === widget.id ? null : widget.id);
  };

  return (
    <> 
    <Navbar/>
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Let your customers chat with your teams the way they chat with their friends
        </h1>
        <p className={styles.subtitle}>
          Regularly nominated as one of the best website chat software, Crisp chat widget helps your
          team to improve customer satisfaction through proactive and meaningful conversations,
          efficient routings, and cross-channel continuity to make omnichannel not just a buzzword, but a reality.
        </p>

        <div className={styles.buttons}>
          <button className={styles.primaryBtn}>Get started for free</button>
          <button className={styles.secondaryBtn}>Explore the features</button>
        </div>

        <p className={styles.trialNote}>14 days free trial — No commitment</p>
      </div>
    </section>

    
        <div className={styles.widgetsContainer}>
      <div className={styles.widgetsLeftPanel}>
        <h1 className={styles.heading}>
          Make them<br />feel unique
        </h1>
        <div className={styles.widgetsList}>
          {widgets.map(widget => (
            <div
              key={widget.id}
              className={`${styles.widgetItem} ${active.id === widget.id ? styles.active : ''} ${openId === widget.id ? styles.expanded : ''}`}
              onClick={() => handleClick(widget)}
            >
              <div className={styles.widgetHeader}>
                <span className={styles.widgetIcon}>{widget.icon}</span>
                <span className={styles.widgetTitle}>{widget.title}</span>
              </div>
              {openId === widget.id && (
                <div className={styles.widgetContent}>
                  {widget.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.widgetsRightPanel}>
        <img src={images[active.image]} alt="Widget View" className={styles.widgetImage} />
      </div>
    </div>
    <Footer/>
    </>
  );
}
