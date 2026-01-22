import React,{useState} from "react";

import styles from "./KnowledgeBase.module.css";
import NavBar from "../../head/Navbar";
import images from "../../../assets/images";
import KnowledgeProcess from "./KnowledgeProcess";
import { widgets } from "./KnowledgeData";


const KnowledgeBase = () => {

   const [active, setActive] = useState(widgets[0]);
    const [openId, setOpenId] = useState(widgets[0].id);
  
    const handleClick = (widget) => {
      setActive(widget);
      setOpenId(prev => prev === widget.id ? null : widget.id);
    };

  return (
    <>
      <NavBar />
      <section className={styles.knowledgeHeroSection}>
        <img src={images.knowledgeHeroImage} alt="background" className={styles.knowledgeBgImage} />

        <div className={styles.knowledgeContent}>
          <h1 className={styles.knowledgeTitle}>
            <span className={`${styles.knowledgeFalldown} ${styles.gradientText}`}>
              Enable your customers to find answers on their own with a powerful knowledge base.
            </span>
            <br />
          </h1>
          <p className={styles.knowledgeSubtitle}>
            Empower both your teams and customers by adopting a self-service approach that supports asynchronous
            communication. With a dedicated help center, businesses can use Crisp’s knowledge base software to deliver
            clear guides and step-by-step articles that assist customers at every stage of their journey
          </p>
          <button className={styles.knowledgeHerobutton}>View Demo →</button>
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

    <KnowledgeProcess/>
    </>

  );
};

export default KnowledgeBase;
