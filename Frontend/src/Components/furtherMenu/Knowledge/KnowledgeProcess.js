import React, {Fragment} from 'react';
import styles from './knowledgeProcess.module.css';
import images from '../../../assets/images';
import { Link } from 'react-router';
import {significantSteps} from './KnowledgeData';
import { steps} from './KnowledgeData';
import KnowledgeTestimonials from './KnowledgeTestimonials';





const KnowledgeProcess = () => {
  return (
<Fragment>
    <section className={styles.processSection}>
      <div className={styles.header}>
        <span className={styles.label}>WORK PROCESS</span>
        <h2>We Follow Four Simple Steps</h2>
        <p>We are leading technology solutions providing company all over the world doing over 40 years lorem ipsum dolor sit amet.</p>
      </div>

      <div className={styles.stepsContainer}>
        {steps.map((step, index) => (
          <div className={styles.stepCard} key={index}>
            <div className={styles.iconWrapper}>
              <img src={step.img} alt={step.title} className={styles.iconImage} />
              <span className={styles.stepNumber}>{step.number}</span>
            </div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>

  <div className={styles.curiousSectionWrapper}>
      <div className={styles.curiousSectionContainer}>
        <div className={styles.curiousSectionImage}>
          <img src={images.KnowledgeProcess} alt="Curious illustration" />
        </div>
        <div className={styles.curiousSectionContent}>
          <h2 className={styles.curiousSectionTitle}>Curious about Mediator?</h2>
          <p className={styles.curiousSectionText}>
            Book a demo with our experts to learn more about Mediator and how it can help your business
          </p>
          <div className={styles.curiousSectionButtons}>
            <button className={styles.curiousSectionDemoBtn}>Request a demo</button>
            <Link to='/signup'><button className={styles.curiousSectionFreeBtn}>Get started for free</button></Link>
          </div>
        </div>
      </div>
    </div>

    {/* significant section */}

    <section className={styles.significantSection}>
          <h2 className={styles.significantTitle}>Significant things you wouldn't want to miss</h2>
          <div className={styles.significantItemsWrapper}>
            {significantSteps.map((item, idx) => (
              <div className={styles.significantItemCard} key={idx}>
                <img src={item.icon} alt={item.title} className={styles.icon} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>



       <KnowledgeTestimonials/>
    </Fragment>
  );
};

export default KnowledgeProcess;
