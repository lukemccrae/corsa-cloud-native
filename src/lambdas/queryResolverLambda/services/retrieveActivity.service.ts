import type { Activity } from '../types';
import { stravaGetHttpClient } from '../../clients/httpClient';

interface ActivityArgs {
  userId: string;
  limit: number;
  offset: number;
  dateFrom: number;
  dateTo: number;
  token: string;
}

export const getActivityById = (): any => {
  return {
    id: '56789',
    name: 'Race',
    distance: 50.0,
    start_date: '56789'
  };
};

export const getActivities = async (args: ActivityArgs): Promise<any> => {
  const url = `https://www.strava.com/api/v3/athlete/activities?before=${args.dateTo}&after=${args.dateFrom}&per_page=${args.limit}&page=${args.offset}`;
  const token = args.token;

  const activities = await stravaGetHttpClient({ url, token });

  return activities.map((activity: Activity) => {
    const { id, name, start_date, distance } = activity;
    return { id, name, start_date, distance };
  });
};
