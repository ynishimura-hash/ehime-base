
import { JOBS, COMPANIES } from './src/lib/dummyData';

const companyIds = new Set(COMPANIES.map(c => c.id));
const missingCompanies = JOBS.filter(j => !companyIds.has(j.companyId));

if (missingCompanies.length > 0) {
    console.log('Jobs with missing companies:', missingCompanies.map(j => ({ jobId: j.id, companyId: j.companyId })));
} else {
    console.log('All jobs have valid companies.');
}

const companiesWithoutImage = COMPANIES.filter(c => !c.image);
if (companiesWithoutImage.length > 0) {
    console.log('Companies without images:', companiesWithoutImage.map(c => c.id));
} else {
    console.log('All companies have images.');
}
