import { Download } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import Select from '../UI/Select';
import { getDateRangeOptions } from '../../config/dateRanges';

const ExportCard = ({ t, selectedDays, onDaysChange, onExport, exporting }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Download className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-neutral-900">{t('exportMyData')}</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{t('exportMyDataDesc')}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-4">
        <Select
          label={t('timePeriod')}
          value={selectedDays}
          onChange={(e) => onDaysChange(e.target.value)}
          options={getDateRangeOptions(t)}
        />
        <Button onClick={onExport} loading={exporting} icon={Download} className="w-full">
          {exporting ? t('exportingLabel') : t('downloadExcel')}
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default ExportCard;
