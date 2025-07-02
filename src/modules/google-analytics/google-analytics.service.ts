import { Injectable } from '@nestjs/common';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import * as fs from 'fs';

@Injectable()
export class GoogleAnalyticsService {
  private analyticsDataClient: BetaAnalyticsDataClient;
  private propertyId: string;

  constructor() {
    const credentialsPath = process.env.GA_CREDENTIALS_PATH;
    this.propertyId = process.env.GA_PROPERTY_ID!;
    this.analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: JSON.parse(fs.readFileSync(credentialsPath, 'utf8')),
    });
  }

  /**
   * Get the number of users (viewers) for a given date range.
   */
  async getViewerCount(startDate = '7daysAgo', endDate = 'today'): Promise<number> {
    const [response] = await this.analyticsDataClient.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'users' }],
    });
    return Number(response.rows?.[0]?.metricValues?.[0]?.value ?? 0);
  }
}