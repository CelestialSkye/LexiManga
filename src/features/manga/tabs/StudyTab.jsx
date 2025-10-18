import { SRSGame } from '../../../components';

const StudyTab = ({ manga }) => {
  return (
    <div className="p-2 pb-4 rounded-[16px]">
      <h2 className='mb-4 text-xl font-bold pr-4 pt-4'>Study</h2>
      <SRSGame manga={manga} />
    </div>
  );
};

export default StudyTab;