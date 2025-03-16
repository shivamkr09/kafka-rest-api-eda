import 'dotenv/config';
export const config = {
    connectionString:process.env.EVENT_HUB_NAMESPACE_CONN_STRING!,
    eventHubName:process.env.EVENT_HUB_NAME!,
    databaseUrl:process.env.DATABASE_URL!
  };
  