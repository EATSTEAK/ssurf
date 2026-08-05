# @ssurf/lms-api

Canvas/LearningX API client for SSURF. The default endpoint is `https://canvas.ssu.ac.kr`.

```ts
import { lmsApi } from '@ssurf/lms-api';

const profile = await lmsApi.getSelfProfile({ accessToken });
const courses = await lmsApi.getActiveCourses({ accessToken });
const items = await lmsApi.getUpcomingLearningItems({
  accessToken,
  daysAhead: 60,
});
const announcements = await lmsApi.getAnnouncements({ accessToken, courses });
const grades = await lmsApi.getGradedSubmissions({ accessToken, courses });
```

Every call is stateless. Pass `baseUrl` for another Canvas-compatible endpoint
or `request` to inject a fetch implementation.
