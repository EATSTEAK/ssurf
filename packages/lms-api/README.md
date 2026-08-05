# @ssurf/lms-api

Canvas/LearningX API client for SSURF. The default endpoint is `https://canvas.ssu.ac.kr`.

```ts
import { LmsApiClient } from '@ssurf/lms-api';

const api = new LmsApiClient({ accessToken });
const profile = await api.getSelfProfile();
const courses = await api.getActiveCourses();
const items = await api.getUpcomingLearningItems({ daysAhead: 60 });
const announcements = await api.getAnnouncements({ courses });
const grades = await api.getGradedSubmissions({ courses });
```

Pass `baseUrl` for another Canvas-compatible endpoint or `request` to inject a fetch implementation.
