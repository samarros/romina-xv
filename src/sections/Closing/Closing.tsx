import { editorial } from '../../data/editorial';
import { Crown, Divider, RoseBouquet, Sparkle } from '../../components/decorative/Ornaments';
import { ParticleField } from '../../motion/ParticleField';
import styles from './Closing.module.css';

export function Closing() {
  return <footer id="cierre" className={styles.closing} tabIndex={-1} data-animation="closing">
    <RoseBouquet className={styles.left} data-layer="closing-flowers" /><RoseBouquet className={styles.right} data-layer="closing-flowers" />
    <div className={styles.content}><Divider className={styles.divider} /><p>{editorial.closing}</p><div className={styles.monogram} data-motion="closing-monogram" role="img" aria-label="Monograma LR de Lia Romina"><Crown /><span aria-hidden="true">LR</span></div></div>
    <Sparkle className={styles.sparkle} data-motion="closing-sparkle" />
    <ParticleField closing />
  </footer>;
}
