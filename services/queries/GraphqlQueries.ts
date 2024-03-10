import gql from "graphql-tag";
//import type { CompanyDto } from "../dto/companies.dto";

// ***** Queries *****

export const WRONG_QUERY = gql`
    query huery {
        nothing {
            here
        }
    }
`;
export const GET_MENU = gql`
    query menu {
        menu2 {
            label
            icon
            to { name }
            items {
                label
                icon
                to { name }
            }
        }
    }
`;

export const GET_PERMISSIONS = gql`
    query permissions {
        permissions {
            route
            action
        }
    }
`;

export const GET_SESSION = gql`
    query session {
        session {
            userId
            username
        }
    }
`;

export const GET_CATEGORIES = gql`
    query getCategories {
        categories {
            _id
            name
            description
        }
    }
`;

export const GET_POSTS = gql`
    query getPosts {
        posts {
            _id
            title
            description
            filename
            category {
                _id
                name
            }
        }

        categories {
            _id
            name
            description
        }    
    }
`;

export const GET_POST = gql`
    query getPost($_id: String!) {
        post(_id: $_id) {
            _id,
            id,
            title,
            description,
            category{
                _id,
                id,
                name,
                description
            },
            filename,
        }
        categories {
            _id
            name
            description
        }  
    }
`;

export const GET_COMPANIES = gql`
    query getCompanies {
        companies {
            _id
            name
            name_short
            inn
        }
    }
`;

export const GET_EMPLOYEES = gql`
    query getEmployees($filters: ListEmployeeInput) {
        employees(filters: $filters) {
            _id
            name
            name_short
            company{
                _id
                name
            }
        }

        companies{
            _id
            name
        }        
    }
`;

export const GET_JOB_TITLES = gql`
    query getJobTitles($filters: ListJobTitleInput) {
        jobTitles(filters: $filters) {
            _id
            name
            name_short
            company{
                _id
                name
            }
        }

        companies{
            _id
            name
        }        
    }
`;

export const GET_INVESTIGATIONS = gql`
    query getInvestigations {
        investigations{
            _id
            title
            image
            company{
                _id
                name
                }
            }

        companies{
            _id
            name
        }        
    }
`;

export const GET_INVESTIGATION = gql`
    query getInvestigation ($_id: String!) {
        investigation(_id: $_id) {
            _id
            title
            description
            company{
                _id
                name
                name_short
                }
            content
            current_node
            global_data
            image
        }
    }
`;


// ***** Mutations *****

export const CREATE_USER = gql`
    mutation createUser($payload: CreateUserInput!) {
        createUser(payload: $payload) {
            _id
            name
            email
            roles
            created_at
        }
    }
`;

export const LOGIN_USER = gql`
    mutation login($payload: LoginInput!) {
        login(payload: $payload) {
            id
            name
            email
            access_token
        }
    }
`;

export const CREATE_POST = gql`
    mutation createPost($payload: CreatePostInput!) {
        createPost(payload: $payload) {
            _id
            id
            title
            description
            filename
            category {
                _id
                name
            }
        }
    }
`;

export const UPDATE_POST = gql`
    mutation updatePost($payload: UpdatePostInput!) {
        updatePost(payload: $payload) {
            _id
            id
            title
            description
            filename
            category {
                _id
                name
            }
        }
    }
`;

export const DELETE_POST = gql`
    mutation deletePost($_id: String!) {
        deletePost(_id: $_id) {
            _id
            id
            title
            description
            filename
            category {
                _id
                name
            }
        }
    }
`;

export const CREATE_COMPANY = gql`
    mutation createCompany($payload: CreateCompanyInput!) {
        createCompany(payload: $payload) {
            _id
            name
            name_short
            inn
        }
    }
`;

export const SAVE_COMPANIES = gql`
    mutation saveCompanies($payload: [UpdateCompanyInput!]!) {
        saveCompanies(payload: $payload) {
            _id
            name
            name_short
            inn
        }
    }
`;

export const DELETE_COMPANY = gql`
    mutation deleteEmployee($_id: String!) {
        deleteEmployee(_id: $_id) {
            _id
            name
            name_short
            company {
                _id
                name
            }
        }
    }
`;

export const CREATE_EMPLOYEE = gql`
    mutation createEmployee($payload: CreateEmployeeInput!) {
        createEmployee(payload: $payload) {
            _id
            name
            name_short
            company {
                _id
                name
            }
        }
    }
`;

export const SAVE_EMPLOYEES = gql`
    mutation saveEmployees($payload: [UpdateEmployeeInput!]!) {
        saveEmployees(payload: $payload) {
            _id
            name
            name_short
            company {
                _id
                name
            }
        }
    }
`;

export const DELETE_EMPLOYEE = gql`
    mutation deleteEmployee($_id: String!) {
        deleteEmployee(_id: $_id) {
            _id
            name
            name_short
            company {
                _id
                name
            }
        }
    }
`;

export const CREATE_JOB_TITLE = gql`
    mutation createJobTitle($payload: CreateJobTitleInput!) {
        createJobTitle(payload: $payload) {
            _id
            name
            name_short
            company {
                _id
                name
            }
        }
    }
`;
export const SAVE_JOB_TITLES = gql`
    mutation saveJobTitles($payload: [UpdateJobTitleInput!]!) {
        saveJobTitles(payload: $payload) {
            _id
            name
            name_short
            company {
                _id
                name
            }
        }
    }
`;

export const DELETE_JOB_TITLE = gql`
    mutation deleteJobTitle($_id: String!) {
        deleteJobTitle(_id: $_id) {
            _id
            name
            name_short
            company {
                _id
                name
            }
        }
    }
`;

export const CREATE_INVESTIGATION = gql`
    mutation createInvestigation ($payload: CreateInvestigationInput!) {
        createInvestigation(payload: $payload) {
            _id
            title
            description
            company{
                _id
                name
                name_short
                }
            content
            current_node
            global_data
            image
        }
    }
`;

export const UPDATE_INVESTIGATION = gql`
    mutation updateInvestigation($payload: UpdateInvestigationInput!) {
        updateInvestigation(payload: $payload) {
            _id
            title
            description
            company{
                _id
                name
                name_short
                }
            content
            current_node
            global_data
            image
        }
    }
`;
