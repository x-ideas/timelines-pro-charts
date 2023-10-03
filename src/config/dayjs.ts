import dayjs from 'dayjs';
import weekYear from 'dayjs/plugin/weekYear'; // dependent on weekOfYear plugin
import weekOfYear from 'dayjs/plugin/weekOfYear';
import quarter from 'dayjs/plugin/quarterOfYear';
import weekDay from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(quarter);
dayjs.extend(weekDay);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
	weekStart: 1,
});
