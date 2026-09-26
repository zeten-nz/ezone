import { getSerialNumbers } from '../../utils/equipmentSerials';

const SerialList = ({ serial_number, serial_numbers }) => {
  const values = getSerialNumbers({ serial_number, serial_numbers });
  return values.length ? <span className="block space-y-1 min-w-0">{values.map((value, index) =>
    <span key={index} className="block font-mono text-xs break-all">{value}</span>)}</span> : <span>—</span>;
};
export default SerialList;
