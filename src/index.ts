const appInsights = require('applicationinsights');
require('source-map-support').install();
const port = process.env.PORT || 3000;
import config from './configs/config';
import logger from './models/logger';
appInsights
	.setup(process.env.APP_INSIGHTS_KEY)
	.setAutoDependencyCorrelation(true)
	.setAutoCollectRequests(true)
	.setAutoCollectPerformance(true)
	.setAutoCollectExceptions(true)
	.setAutoCollectDependencies(true)
	.setUseDiskRetryCaching(true);
appInsights.start();
async function initApp() {
	try {
		logger.init(config.azureLogStorage);
		const app: { listen: Function } = require('./App').default;
		app.listen(port, (error: Error) => {
			if (error) {
				throw error;
			}
			return console.log(`server is listening on ${port}`);
		});
	} catch (error) {
		console.error(error);
	}
}

initApp();
