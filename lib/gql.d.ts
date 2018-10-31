// tslint:disable
// graphql typescript definitions

declare namespace GQL {
interface IGraphQLResponseRoot {
data?: IQuery | IMutation;
errors?: Array<IGraphQLResponseError>;
}

interface IGraphQLResponseError {
/** Required for all errors */
message: string;
locations?: Array<IGraphQLResponseErrorLocation>;
/** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
[propName: string]: any;
}

interface IGraphQLResponseErrorLocation {
line: number;
column: number;
}

interface IQuery {
__typename: "Query";
node: Node | null;
getDigitalDiplomaById: IDigitalDiploma | null;
getCourseById: ICourse | null;
courseById: ICourse | null;
courseUnit: ICourseUnit | null;
getCourseDeliverySchedule: ICourseDeliverySchedule | null;
courseDeliverySchedule: ICourseDeliverySchedule | null;
cardEntry: ISectionCard | null;
getCard: ISectionCard | null;
getCardByQuestion: ISectionCard | null;
topicFilter: Array<IListDef | null> | null;
getUserActivityCountByDate: Array<IUserActivity | null> | null;
getUserProfile: IUser | null;
userProfile: IUser | null;
examToTake: IExam | null;
examSession: Array<IExamSession | null> | null;
listActivities: IActivityConnection | null;
listCards: ISectionCardConnection | null;
coursePaging: ICourseConnection | null;
listCourses: ICourseConnection | null;
langType: Array<ILang | null> | null;
listInstructors: IUserConnection | null;
notificationPaging: INotificationPaging | null;
getQuestionHint: IQuestion | null;
questionHint: IQuestion | null;
listSections: IUnitSectionConnection | null;
unitPaging: ICourseUnitConnection | null;
listUnits: ICourseUnitConnection | null;
listDigitalDiplomas: IDigitalDiplomaConnection | null;
userCourseUnitExamStatusPaging: ICourseUnitConnection | null;
}

interface INodeOnQueryArguments {
id: string;
}

interface IGetDigitalDiplomaByIdOnQueryArguments {
digital_diploma_id?: string | null;
}

interface IGetCourseByIdOnQueryArguments {
course_id?: string | null;
}

interface ICourseByIdOnQueryArguments {
course_id?: string | null;
}

interface ICourseUnitOnQueryArguments {
course_id?: string | null;
unit_id?: string | null;
}

interface IGetCourseDeliveryScheduleOnQueryArguments {
course_id?: string | null;
delivery_method?: string | null;
date_on_or_after?: any | null;
}

interface ICourseDeliveryScheduleOnQueryArguments {
course_id?: string | null;
delivery_method?: string | null;
date_on_or_after?: any | null;
}

interface ICardEntryOnQueryArguments {
course_id: string;
unit_id: string;
section_id: string;
card_id: string;
}

interface IGetCardOnQueryArguments {
course_id: string;
unit_id: string;
section_id: string;
card_id: string;
}

interface IGetCardByQuestionOnQueryArguments {
question_id: string;
}

interface IGetUserActivityCountByDateOnQueryArguments {
dateRange?: IDateRange | null;
activityTypes?: Array<string | null> | null;
}

interface IGetUserProfileOnQueryArguments {
user_id?: string | null;
}

interface IUserProfileOnQueryArguments {
user_id?: string | null;
}

interface IExamToTakeOnQueryArguments {
unit_id?: string | null;
course_id?: string | null;
}

interface IExamSessionOnQueryArguments {
unit_id?: string | null;
}

interface IListActivitiesOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
activityTypes?: Array<string | null> | null;
dateRange?: IDateRange | null;
listDefVersion?: number | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IListCardsOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface ICoursePagingOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IListCoursesOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IListInstructorsOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
instructorTopics?: Array<string | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IGetQuestionHintOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IQuestionHintOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IListSectionsOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IUnitPagingOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IListUnitsOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IListDigitalDiplomasOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IUserCourseUnitExamStatusPagingOnQueryArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

type Node = IDigitalDiploma | ICourse | ICourseUnit | IUnitSection | ISectionCard | IVersionedContentRecord | IQuestion | IQuestionData | IQuestionMultipleData | ICourseDeliverySchedule | IScheduledRunSessionInfoType | IScheduledRunType | IScheduledRunSessionType | ISessionInstructorType | IListDef | IUser | IUserSubscription | IAuthStrategy | IUserOrganizationRole | IUserCourseRole | IExam | IExamSession | IActivity | ILang | IUserNotification;

interface INode {
__typename: "Node";
id: string;
}

interface IDigitalDiploma {
__typename: "DigitalDiploma";
id: string;
title: string;
headline: string;
description: string;
organization_ids: Array<string | null> | null;
primary_locale: string | null;
logo_url: string;
cover_url: string;
is_published: boolean;
topics: Array<string | null> | null;
info_md: string;
skill_level: number | null;
est_minutes: number | null;
is_project: boolean | null;
primary_topic: string | null;
instructor_timekit: IInstructorTimekit | null;
plans: Array<IDigitalDiplomaPlan | null> | null;
}

interface IInstructorTimekit {
__typename: "InstructorTimekit";
intervals: Array<ITimekitInterval | null> | null;
}

interface ITimekitInterval {
__typename: "TimekitInterval";
credits: number | null;
duration_seconds: number | null;
project_id: string | null;
}

interface IDigitalDiplomaPlan {
__typename: "DigitalDiplomaPlan";
_id: string | null;
title: string | null;
headline: string | null;
cost: number | null;
is_hidden: boolean | null;
closes_at: string | null;
opens_at: string | null;
}

interface ICourse {
__typename: "Course";
id: string;
title: string;
headline: string;
description: string;
organization_ids: Array<string | null> | null;
primary_locale: string | null;
logo_url: string;
cover_url: string;
is_published: boolean;
is_organization_only: boolean;
subscription_level: number;
units: ICourseUnitConnection | null;
topics: Array<string | null> | null;
enrolled_count: number;
view_count: number;
info_md: string;
repo_url: string | null;
verified_cert_cost: number | null;
skill_level: number | null;
est_minutes: number | null;
primary_topic: string | null;
last_accessed_at: string | null;
last_accessed_unit: string | null;
last_accessed_section: string | null;
last_accessed_card: string | null;
delivery_methods: Array<string | null> | null;
instructor_timekit: IInstructorTimekit | null;
weight: number | null;
}

interface IUnitsOnCourseArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IOrderBy {
field?: string | null;
direction?: OrderByDirection | null;
}

const enum OrderByDirection {
DESC = 'DESC',
ASC = 'ASC'
}

interface IFilterValues {
filterValuesString?: string | null;
}

interface IQueryResolverArgs {
param?: string | null;
value?: string | null;
}

interface ICourseUnitConnection {
__typename: "CourseUnitConnection";
pageInfo: IPageInfo;
edges: Array<ICourseUnitEdge | null> | null;
}

interface IPageInfo {
__typename: "PageInfo";
hasNextPage: boolean;
hasPreviousPage: boolean;
startCursor: string | null;
endCursor: string | null;
}

interface ICourseUnitEdge {
__typename: "CourseUnitEdge";
node: ICourseUnit | null;
cursor: string;
}

interface ICourseUnit {
__typename: "CourseUnit";
id: string;
index: number | null;
title: string | null;
headline: string | null;
sections: IUnitSectionConnection | null;
sections_list: Array<IUnitSection | null> | null;
has_exam: boolean | null;
final_exam_weight_pct: number | null;
attempts_left: number | null;
unit_progress_state: number | null;
ema: number | null;
grade: number | null;
is_continue_exam: boolean | null;
exam_attempt_id: string | null;
exam_session_id: string;
last_attempted_at: string | null;
attempts: number | null;
passed: boolean | null;
}

interface ISectionsOnCourseUnitArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IUnitSectionConnection {
__typename: "UnitSectionConnection";
pageInfo: IPageInfo;
edges: Array<IUnitSectionEdge | null> | null;
}

interface IUnitSectionEdge {
__typename: "UnitSectionEdge";
node: IUnitSection | null;
cursor: string;
}

interface IUnitSection {
__typename: "UnitSection";
id: string;
index: number | null;
title: string | null;
headline: string | null;
ema: number | null;
cards_list: Array<ISectionCard | null> | null;
cards: ISectionCardConnection | null;
}

interface ICardsOnUnitSectionArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface ISectionCard {
__typename: "SectionCard";
id: string;
index: number | null;
title: string | null;
headline: string | null;
content_id: string | null;
tags: Array<string | null> | null;
question_ids: Array<string | null> | null;
ema: number | null;
content: IVersionedContentRecord | null;
question: IQuestion | null;
questions: Array<IQuestion | null> | null;
currentCourseId: string;
currentUnitId: string;
currentSectionId: string;
}

interface IVersionedContentRecord {
__typename: "VersionedContentRecord";
id: string;
version: number;
content: string;
}

interface IQuestion {
__typename: "Question";
id: string;
tags: Array<string | null>;
points: number | null;
est_time_sec: number | null;
compl_level: number | null;
question_type: string;
question_text: string;
data: IQuestionData;
question_answer: string | null;
hint: string | null;
hint_exists: boolean | null;
card_id: string;
}

interface IQuestionData {
__typename: "QuestionData";
id: string;
tmpl_files: string | null;
environment_key: string | null;
use_advanced_features: boolean | null;
explanation: string | null;
src_files: string | null;
options: Array<IQuestionMultipleData | null> | null;
}

interface IQuestionMultipleData {
__typename: "QuestionMultipleData";
id: string;
seq: number;
explanation: string;
is_answer: boolean;
text: string;
}

interface ISectionCardConnection {
__typename: "SectionCardConnection";
pageInfo: IPageInfo;
edges: Array<ISectionCardEdge | null> | null;
}

interface ISectionCardEdge {
__typename: "SectionCardEdge";
node: ISectionCard | null;
cursor: string;
}

interface ICourseDeliverySchedule {
__typename: "CourseDeliverySchedule";
id: string;
_id: string | null;
delivery_methods: Array<string | null> | null;
delivery_structure: string | null;
course_duration: IEventDuration | null;
course_notes: string | null;
session_info: Array<IScheduledRunSessionInfoType | null> | null;
scheduled_runs: Array<IScheduledRunType | null> | null;
}

interface IEventDuration {
__typename: "EventDuration";
months: number | null;
weeks: number | null;
days: number | null;
hours: number | null;
minutes: number | null;
}

interface IScheduledRunSessionInfoType {
__typename: "ScheduledRunSessionInfoType";
id: string;
session_seq: number | null;
headline: string | null;
desc: string | null;
session_notes: string | null;
}

interface IScheduledRunType {
__typename: "ScheduledRunType";
id: string;
run_start_date: any | null;
_id: string | null;
offered_at_price: IItemPriceType | null;
run_sessions: Array<IScheduledRunSessionType | null> | null;
seat_purchased: boolean | null;
}

interface IItemPriceType {
__typename: "ItemPriceType";
amount: number | null;
}

interface IScheduledRunSessionType {
__typename: "ScheduledRunSessionType";
id: string;
session_seq: number | null;
session_start_date: any | null;
_id: string | null;
session_run_notes: string | null;
instructors: Array<ISessionInstructorType | null> | null;
session_duration: IEventDuration | null;
}

interface ISessionInstructorType {
__typename: "SessionInstructorType";
id: string;
_id: string | null;
full_name: string | null;
username: string | null;
avatar_url: string | null;
headline: string | null;
biography: string | null;
}

interface IListDef {
__typename: "ListDef";
id: string;
type: string;
value: string;
}

interface IDateRange {
date_from?: any | null;
date_to?: any | null;
}

interface IUserActivity {
__typename: "UserActivity";
id: string;
date: string;
count: number;
}

interface IUser {
__typename: "User";
id: string;
full_name: string | null;
username: string | null;
primary_email: string | null;
pwd: string | null;
secondary_emails: Array<string | null> | null;
biography: string | null;
is_demo: boolean | null;
is_instructor: boolean | null;
headline: string | null;
has_completed_first_tutorial: boolean | null;
instructor_topics_en: Array<string | null> | null;
instructor_topics_locale: Array<string | null> | null;
locales: Array<string | null> | null;
primary_locale: string;
subscription: IUserSubscriptionConnection | null;
avatar_url: string | null;
twitter_username: string | null;
linkedin_username: string | null;
location_name: string | null;
is_verified: boolean | null;
auth_strategies: IAuthStrategyConnection | null;
organization_roles: IUserOrganizationRoleConnection | null;
instructor_timekit: IInstructorTimekit | null;
course_roles: IUserCourseRoleConnection | null;
}

interface IAuthStrategiesOnUserArguments {
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IOrganizationRolesOnUserArguments {
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface ICourseRolesOnUserArguments {
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IUserSubscriptionConnection {
__typename: "UserSubscriptionConnection";
pageInfo: IPageInfo;
edges: Array<IUserSubscriptionEdge | null> | null;
}

interface IUserSubscriptionEdge {
__typename: "UserSubscriptionEdge";
node: IUserSubscription | null;
cursor: string;
}

interface IUserSubscription {
__typename: "UserSubscription";
id: string;
level: number;
}

interface IAuthStrategyConnection {
__typename: "AuthStrategyConnection";
pageInfo: IPageInfo;
edges: Array<IAuthStrategyEdge | null> | null;
}

interface IAuthStrategyEdge {
__typename: "AuthStrategyEdge";
node: IAuthStrategy | null;
cursor: string;
}

interface IAuthStrategy {
__typename: "AuthStrategy";
id: string;
auth_id: string;
email: string | null;
method: string;
version: string;
}

interface IUserOrganizationRoleConnection {
__typename: "UserOrganizationRoleConnection";
pageInfo: IPageInfo;
edges: Array<IUserOrganizationRoleEdge | null> | null;
}

interface IUserOrganizationRoleEdge {
__typename: "UserOrganizationRoleEdge";
node: IUserOrganizationRole | null;
cursor: string;
}

interface IUserOrganizationRole {
__typename: "UserOrganizationRole";
id: string;
organization_id: string;
role: string;
}

interface IUserCourseRoleConnection {
__typename: "UserCourseRoleConnection";
pageInfo: IPageInfo;
edges: Array<IUserCourseRoleEdge | null> | null;
}

interface IUserCourseRoleEdge {
__typename: "UserCourseRoleEdge";
node: IUserCourseRole | null;
cursor: string;
}

interface IUserCourseRole {
__typename: "UserCourseRole";
id: string;
course_id: string;
role: Array<string | null>;
last_accessed_at: string | null;
}

interface IExam {
__typename: "Exam";
id: string;
creator_id: string;
question_ids: Array<string | null> | null;
tags: Array<string | null> | null;
random_order: boolean;
question_count: number;
time_limit: number | null;
use_ide_test_mode: boolean;
est_time: number | null;
}

interface IExamSession {
__typename: "ExamSession";
id: string;
exam_id: string;
user_id: string;
course_unit_id: string;
question_ids: Array<string | null> | null;
question_interaction_ids: Array<string | null>;
started_at: string | null;
is_active: boolean | null;
submitted_at: string | null;
time_limit_exceeded: boolean | null;
}

interface IActivityConnection {
__typename: "ActivityConnection";
pageInfo: IPageInfo;
edges: Array<IActivityEdge | null> | null;
}

interface IActivityEdge {
__typename: "ActivityEdge";
node: IActivity | null;
cursor: string;
}

interface IActivity {
__typename: "Activity";
id: string;
user_id: string;
date: string;
activity_link: string;
type: string;
type_desc: string | null;
content: string;
}

interface ICourseConnection {
__typename: "CourseConnection";
pageInfo: IPageInfo;
edges: Array<ICourseEdge | null> | null;
}

interface ICourseEdge {
__typename: "CourseEdge";
node: ICourse | null;
cursor: string;
}

interface ILang {
__typename: "Lang";
id: string;
label: string | null;
value: string | null;
}

interface IUserConnection {
__typename: "UserConnection";
pageInfo: IPageInfo;
edges: Array<IUserEdge | null> | null;
}

interface IUserEdge {
__typename: "UserEdge";
node: IUser | null;
cursor: string;
}

interface INotificationPaging {
__typename: "notificationPaging";
notifications: IUserNotificationConnection | null;
}

interface INotificationsOnNotificationPagingArguments {
orderBy?: Array<IOrderBy | null> | null;
filterValues?: IFilterValues | null;
resolverArgs?: Array<IQueryResolverArgs | null> | null;
after?: string | null;
first?: number | null;
before?: string | null;
last?: number | null;
}

interface IUserNotificationConnection {
__typename: "UserNotificationConnection";
pageInfo: IPageInfo;
edges: Array<IUserNotificationEdge | null> | null;
}

interface IUserNotificationEdge {
__typename: "UserNotificationEdge";
node: IUserNotification | null;
cursor: string;
}

interface IUserNotification {
__typename: "UserNotification";
id: string;
actor: string | null;
notification_link: string;
def_id: string;
is_read: boolean;
created_at: string;
updated_at: string;
content: string | null;
}

interface IDigitalDiplomaConnection {
__typename: "DigitalDiplomaConnection";
pageInfo: IPageInfo;
edges: Array<IDigitalDiplomaEdge | null> | null;
}

interface IDigitalDiplomaEdge {
__typename: "DigitalDiplomaEdge";
node: IDigitalDiploma | null;
cursor: string;
}

interface IMutation {
__typename: "Mutation";
readNotification: IReadNotificationPayload | null;
startExam: IStartExamPayload | null;
submitExam: ISubmitExamPayload | null;
submitAnswer: ISubmitAnswerPayload | null;
getCurrentExamQuestionAnswer: IGetCurrentExamQuestionAnswerPayload | null;
setCardQuestionAnswer: ISubmitAnswerPayload | null;
setExamQuestionAnswer: ISetExamQuestionAnswerPayload | null;
updateUserProfile: IUpdateUserProfilePayload | null;
updateUserUnitStatus: IUpdateUserUnitStatusPayload | null;
updateUserCourseRole: IUpdateUserCourseRolePayload | null;
}

interface IReadNotificationOnMutationArguments {
input: IReadNotificationInput;
}

interface IStartExamOnMutationArguments {
input: IStartExamInput;
}

interface ISubmitExamOnMutationArguments {
input: ISubmitExamInput;
}

interface ISubmitAnswerOnMutationArguments {
input: ISubmitAnswerInput;
}

interface IGetCurrentExamQuestionAnswerOnMutationArguments {
input: IGetCurrentExamQuestionAnswerInput;
}

interface ISetCardQuestionAnswerOnMutationArguments {
input: ISubmitAnswerInput;
}

interface ISetExamQuestionAnswerOnMutationArguments {
input: ISetExamQuestionAnswerInput;
}

interface IUpdateUserProfileOnMutationArguments {
input: IUpdateUserProfileInput;
}

interface IUpdateUserUnitStatusOnMutationArguments {
input: IUpdateUserUnitStatusInput;
}

interface IUpdateUserCourseRoleOnMutationArguments {
input: IUpdateUserCourseRoleInput;
}

interface IReadNotificationInput {
notif_id: string;
clientMutationId?: string | null;
}

interface IReadNotificationPayload {
__typename: "ReadNotificationPayload";
completionObj: ICompletionObj | null;
clientMutationId: string | null;
}

interface ICompletionObj {
__typename: "CompletionObj";
code: string | null;
msg: string | null;
msg_id: string | null;
processed: number | null;
modified: number | null;
}

interface IStartExamInput {
courseId: string;
unitId: string;
clientMutationId?: string | null;
}

interface IStartExamPayload {
__typename: "StartExamPayload";
exam_session_id: string | null;
exam_time_limit: number | null;
exam_id: string | null;
completionObj: ICompletionObj | null;
clientMutationId: string | null;
}

interface ISubmitExamInput {
exam_session_id: string;
clientMutationId?: string | null;
}

interface ISubmitExamPayload {
__typename: "SubmitExamPayload";
final_grade_pct: number | null;
pass_mark_pct: number | null;
completionObj: ICompletionObj | null;
clientMutationId: string | null;
}

interface ISubmitAnswerInput {
exam_attempt_id?: string | null;
question_id: string;
response_data?: string | null;
checkAnswer?: boolean | null;
quiz?: boolean | null;
is_quiz_start?: boolean | null;
is_last_question?: boolean | null;
clientMutationId?: string | null;
}

interface ISubmitAnswerPayload {
__typename: "SubmitAnswerPayload";
is_correct: boolean | null;
explain_text: string | null;
grading_response: string | null;
completionObj: ICompletionObj | null;
next_question: INextQuestion | null;
clientMutationId: string | null;
}

interface INextQuestion {
__typename: "NextQuestion";
course_id: string | null;
section_id: string | null;
unit_id: string | null;
}

interface IGetCurrentExamQuestionAnswerInput {
exam_session_id: string;
question_id: string;
clientMutationId?: string | null;
}

interface IGetCurrentExamQuestionAnswerPayload {
__typename: "GetCurrentExamQuestionAnswerPayload";
submitted_at: any | null;
response_data: string | null;
completionObj: ICompletionObj | null;
clientMutationId: string | null;
}

interface ISetExamQuestionAnswerInput {
exam_session_id: string;
question_id: string;
response_data?: string | null;
clientMutationId?: string | null;
}

interface ISetExamQuestionAnswerPayload {
__typename: "SetExamQuestionAnswerPayload";
completionObj: ICompletionObj | null;
clientMutationId: string | null;
}

interface IUpdateUserProfileInput {
locale?: string | null;
profile?: IUserProfileInput | null;
clientMutationId?: string | null;
}

interface IUserProfileInput {
id?: string | null;
full_name?: string | null;
username?: string | null;
primary_email?: string | null;
biography?: string | null;
headline?: string | null;
locales?: Array<string | null> | null;
primary_locale: string;
avatar_url: string;
}

interface IUpdateUserProfilePayload {
__typename: "UpdateUserProfilePayload";
completionObj: ICompletionObj | null;
clientMutationId: string | null;
}

interface IUpdateUserUnitStatusInput {
unit_id?: string | null;
course_id?: string | null;
clientMutationId?: string | null;
}

interface IUpdateUserUnitStatusPayload {
__typename: "UpdateUserUnitStatusPayload";
completionObj: ICompletionObj | null;
clientMutationId: string | null;
}

interface IUpdateUserCourseRoleInput {
user_id: string;
course_id: string;
cudContent: Array<IFieldCud | null>;
clientMutationId?: string | null;
}

interface IFieldCud {
field?: string | null;
valueToAssign?: string | null;
valueToFind?: string | null;
cudAction?: CudAction | null;
}

const enum CudAction {
CREATE = 'CREATE',
UPDATE = 'UPDATE',
DELETE = 'DELETE'
}

interface IUpdateUserCourseRolePayload {
__typename: "UpdateUserCourseRolePayload";
completionObj: ICompletionObj | null;
clientMutationId: string | null;
}
}

// tslint:enable
