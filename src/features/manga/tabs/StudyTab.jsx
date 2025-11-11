import { SRSGame } from '../../../components';

const StudyTab = ({ manga }) => {
  return (
    <div className='rounded-[16px] p-2 pb-4'>
      <h2 className='mb-4 pt-4 pr-4 text-xl font-bold'>Study</h2>
      <SRSGame manga={manga} />
    </div>
  );
};

export default StudyTab;
