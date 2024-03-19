
// Posts queries

export const GET_POST_CATEGORIES = `
    query getPostCategories{
        post_categories{
            id
            name
            description
        }
    }`;

export const CREATE_POST = ``;

export const FETCH_POSTS = `
    query fetchPosts{
        posts(sort: "id"){
            id
            title
            description
            category{
                id
                name
            }
            image{
                id
                filename_disk
                filename_download
                title
                type
            }
            user_created{
                id
                email
                first_name
            }
        }
  
        post_categories{
            id
            name
            description
        }
    }`;

export const GET_POST = `
    query getPost($id: ID!){
        posts_by_id(id: $id){
            id
            title
            description
            category{
                id
                name
            }
            image{
                id
                filename_disk
                filename_download
                title
                type
            }
            user_created{
                id
                email
                first_name
            }
        }
  
        post_categories{
            id
            name
            description
        }
    }`;

export const DELETE_POST = `
    mutation deletePost($id: ID!){
        delete_posts_item(id: $id) {
            id
        }
    }`;


// Companies queries

export const CREATE_COMPANY = `
    mutation createCompany($data: create_companies_input!) {
        create_companies_item(data: $data) {
            id
            name
            name_short
            inn
            user_created {
                id
                first_name
                email
            }
        }
    }`;

export const CREATE_COMPANIES = `
    mutation createCompanies($data: [create_companies_input!]) {
        create_companies_items(data: $data) {
            id
            name
            name_short
            inn
            user_created {
                id
                first_name
                email
            }            
        }
    }`;

export const FETCH_COMPANIES = `
    query fetchCompanies{
        companies(sort: "id"){
            id
            name
            name_short
            inn
            user_created {
                id
                first_name
                email
            }
        }
    }
`;

export const GET_COMPANY = `
    query getCompany($id: ID!){
        companies_by_id(id: $id){
            id
            name
            name_short
            inn
            user_created {
                id
                first_name
                email
            }
        }
    }
`;

export const UPDATE_COMPANY = `
    mutation updateCompany($id: ID!, $data: update_companies_input!){
        update_companies_item(id: $id, data: $data) {
            id
            name
            name_short
            inn
  
            date_created
            user_created{
                id
                email
                first_name
            }
            date_updated
            user_updated{
                id
                email
                first_name
            }
        }
    }`;

export const DELETE_COMPANY = `
    mutation deleteCompany($id: ID!) {
        delete_companies_item(id: $id) {
            id
        }
    }`;

export const DELETE_COMPANIES = `
    mutation deleteCompanies($ids: [ID]!) {
        delete_companies_items(ids: $ids) {
            ids
        }
    }`;


// JobTitles queries

export const FETCH_JOB_TITLES = `
    query fetchJobTitles{
        jobtitles(sort: "id"){
            id
            name
            name_short
            company{
                id
                name
            }
            user_created {
                id
                first_name
                email
            }
        }
    }`;

export const GET_JOB_TITLE = `
    query getJobTitle($id: ID!){
        jobtitles_by_id(id: $id){
            id
            name
            name_short
            company {
                id
                name
            }
            user_created {
                id
                first_name
                email
            }
        }
    }`;

export const DELETE_JOB_TITLE = `
    mutation deleteJobTitle($id: ID!) {
        delete_jobtitles_item(id: $id) {
            id
        }
    }`;

export const DELETE_JOB_TITLES = `
    mutation deleteJobTitles($ids: [ID]!) {
        delete_jobtitles_items(ids: $ids) {
            ids
        }
    }`;


// Employee queries

export const FETCH_EMPLOYEES = `
    query fetchEmployees{
        employees(sort: "id"){
            id
            name
            name_short
            company{
                id
                name
            }
            user_created {
                id
                first_name
                email
            }
        }
    }`;

export const GET_EMPLOYEE = `
    query getEmploee($id: ID!){
        employees_by_id(id: $id){
            id
            name
            name_short
            company {
                id
                name
            }
            user_created {
                id
                first_name
                email
            }
        }
    }`;

export const DELETE_EMPLOYEE = `
    mutation deleteEmployee($id: ID!) {
        delete_employees_item(id: $id) {
            id
        }
    }`;

export const DELETE_EMPLOYEES = `
    mutation deleteEmployees($ids: [ID]!) {
        delete_employees_items(ids: $ids) {
            ids
        }
    }`;


// Maps queries

export const FETCH_MAP_IMAGES = `
query fetchMapImages{
    map_images{
    id
    name
    point1{
      id
      lat
      lng
      x
      y
    }
    point2{
      id
      lat
      lng
      x
      y
    }
    image{
      filename_disk
      filename_download
      filesize
      width
      height
      id
      title
      type
    }
    user_created{
      id
      first_name
      email
    }
  }
}`;

export const GET_MAP_POINTS = `
query getMapPoints($mid: GraphQLStringOrFloat) {
    map_points(sort: ["x"], filter: { map_image: { id: { _eq: $mid } } }) {
      id
      comment
      x
      y
      lat
      lng
    }
}`;

export const GET_MAP_MARKERS = `
query getMapMarkers($mid: GraphQLStringOrFloat) {
    map_markers(sort: ["id"], filter: { map_image: { id: { _eq: $mid } } }) {
      id
      name
      comment
      x
      y
      lat
      lng
    }
}`;

export const DELETE_MAP_MARKER = `
    mutation deleteMapMarker($id: ID!) {
        delete_map_markers_item(id: $id) {
            id
        }
    }`;

export const DELETE_MAP_MARKERS = `
    mutation deleteEmployees($ids: [ID]!) {
        delete_map_markers_items(ids: $ids) {
            ids
        }
    }`;

// Investigation queries

export const FETCH_INVESTIGATIONS = `
query fetchInvs{
    investigations(sort: "id"){
      id
      user_created{
        id
        first_name
        email
      }
      title
      description
      company{
        id
        name
      }
      image{
        id
        filename_disk
        filename_download
        title
        filesize
      }
      state
      content
    }
  }`;
