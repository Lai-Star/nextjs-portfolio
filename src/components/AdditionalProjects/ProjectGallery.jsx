import { AnimatePresence, useReducedMotion, motion } from 'framer-motion';
import { useGlobalContext } from '../../Context/Context';
import { projectData } from '../../data/projectData';
import { StyledProjectButton } from '../../styles/UI/StyledProjectsButton';
import { StyledProjectGallery } from '../../styles/AdditionalProjects/AdditionalProjectsLayout/StyledProjectGallery';
import GalleryItem from './GalleryItem';
import { buttonVariant, parentProjectVariants } from '../../utils/animations';
import { CONSTANTS } from '../../constants';
import { useTranslation } from 'react-i18next';

const ProjectGallery = () => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const { showMoreProjects, toggleMoreProjects } = useGlobalContext();

  // Get the starting point for additional projects based on the constant
  const startingIndex = CONSTANTS.FEATURED_PROJECT_CUTOFF;
  const additionalProjects = projectData.slice(startingIndex);

  // Return early if no additional projects
  if (!showMoreProjects) return null;

  const getProjectDescription = (index) => {
    // Generate description key dynamically
    return t(`projects.${index + startingIndex}.description`);
  };

  return (
    <AnimatePresence>
      <StyledProjectGallery
        key={crypto.randomUUID()} // You may want to avoid using randomUUID here in production as it can cause unnecessary re-renders.
        initial={shouldReduceMotion ? 'noMotion' : 'hidden'}
        animate="visible"
        variants={parentProjectVariants}
        exit="exit"
      >
        {additionalProjects.map((project, index) => (
          <GalleryItem
            key={project.id}
            project={project}
            description={getProjectDescription(index)}
          />
        ))}
        
        <StyledProjectButton
          variants={buttonVariant}
          initial={shouldReduceMotion ? 'noMotion' : 'hidden'}
          animate="visible"
          exit={shouldReduceMotion ? 'noMotion' : 'exit'}
          onClick={toggleMoreProjects}
        >
          {t('show-less-btn')}
        </StyledProjectButton>
      </StyledProjectGallery>
    </AnimatePresence>
  );
};

export default ProjectGallery;
