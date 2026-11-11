import { event } from '../../data/event';
import { editorial } from '../../data/editorial';
import { RoseBouquet, Butterfly } from '../../components/decorative/Ornaments';
import { SectionHeading } from '../../components/ui/SectionHeading';
import styles from './Story.module.css';

export function Story() {
  return <section id="historia" className={styles.section} aria-labelledby="story-title" tabIndex={-1} data-animation="story">
    <RoseBouquet className={styles.flowers} data-motion="ambient-flower" />
    <Butterfly className={styles.butterfly} data-layer="butterfly" />
    <div className={styles.content}>
      <SectionHeading id="story-title">Mi historia</SectionHeading>
      <div className={styles.message} data-motion="story-message">{editorial.story.map(text => <p key={text}>{text}</p>)}</div>
      <div className={styles.family} data-motion="family">
        <div><h3>Con el amor de mis padres</h3>{event.parents.map(name => <p key={name}>{name}</p>)}</div>
        <div><h3>Y la compañía de mis padrinos</h3>{event.godparents.map(name => <p key={name}>{name}</p>)}</div>
      </div>
    </div>
  </section>;
}
