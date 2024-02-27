import { ProjectForm } from "@/common.types";
import { createProjectMutation, createUserMutation, deleteProjectMutation, getProjectByIdQuery, getProjectsOfUserQuery, getUserQuery, projectsQuery, updateProjectMutation } from "@/graphql";
import { GraphQLClient } from "graphql-request";
import { getCurrentUser } from "./session";

const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = isProduction ? process.env.NEXT_PUBLIC_GRAFBASE_API_URL || '' : 'http://127.0.0.1:4000/graphql';
const apiKey = isProduction ? process.env.NEXT_PUBLIC_GRAFBASE_API_KEY || '' : 'letmein';
const serverUrl = isProduction ? process.env.NEXT_PUBLIC_SERVER_URL : 'http://localhost:3000';

// const clientOptions = {
//     headers: {
//       "x-api-key": apiKey,
//     },
//   };

const client = new GraphQLClient(apiUrl)

const makeGraphQLRequest = async (query: string, variables = {}) => {
    try {
         //client.request
      return await client.request(query, variables);
    } catch (err) {
      throw err;
    }
  };

  export const getUser = (email: string) => {
    client.setHeader("x-api-key", apiKey);
    return makeGraphQLRequest(getUserQuery, { email });
  };
  
  export const createUser = (name: string, email: string, avatarUrl: string) => {
    client.setHeader("x-api-key", apiKey);
  
    const variables = {
      input: {
        name,
        email,
        avatarUrl
      },
    };
    
    return makeGraphQLRequest(createUserMutation, variables);
  };

 
// fetch token from server
export const fetchToken = async()=>{
    try {
        const response = await fetch(`${serverUrl}/api/auth/token`)
        return response.json()
    } catch (error) {
        throw error
    }
}

// upload image
export const uploadImage = async (imagePath: string) => {
    try {
      const response = await fetch(`${serverUrl}/api/upload`, {
        method: "POST",
        body: JSON.stringify({
          path: imagePath,
        }),
      });
      return response.json();
    } catch (err) {
      throw err;
    }
  };
  
// create new project 
export const createNewProject = async (form: ProjectForm, creatorId: string, token: string) => {
    // uplaod image to cloudinary
    const imageUrl = await uploadImage(form.image);
  
    if (imageUrl.url) {
        client.setHeader("Authorization", `Bearer ${token}`);

    //   const headers = {Authorization :`Bearer ${token}`}
  
      const variables = {
        input: { 
          ...form, 
          image: imageUrl.url, 
          createdBy: { 
            link: creatorId ,
          }
        }
      };
      console.log(variables, form)
      return makeGraphQLRequest(createProjectMutation, variables);
    }
  };
  
  // fetch all projects
  export const fetchAllProjects = (category?: string | null, endcursor?: string | null) => {
    client.setHeader("x-api-key", apiKey);

    const validCategory = category ?? '';
  
    return makeGraphQLRequest(projectsQuery, { category: validCategory, endcursor });
  };
  

  export const getProjectDetails = (id : string) => {
    client.setHeader('x-api-key', apiKey);
    return makeGraphQLRequest(getProjectByIdQuery, {id})
  }

export const getUserProjects = (id : string, last?: number) => {
  client.setHeader('x-api-key', apiKey);
  return makeGraphQLRequest(getProjectsOfUserQuery, {id, last} )
}

export const deleteProject = (id : string, token: string) => {
  client.setHeader('Authorization', `Bearer ${token}`);
  return makeGraphQLRequest(deleteProjectMutation, {id} )
}

export const updateProject = async(form : ProjectForm, projectId: string, token: string) => {

  // check if image same as before or changed
  function isBase64DataURL(value: string) {
    const base64Regex = /^data:image\/[a-z]+;base64,/;
    return base64Regex.test(value);
  }

  let updatedForm = { ...form };

  const isUploadingNewImage = isBase64DataURL(form.image);

  if (isUploadingNewImage) {
    const imageUrl = await uploadImage(form.image);

    if (imageUrl.url) {
      updatedForm = { ...updatedForm, image: imageUrl.url };
    }
  }

  client.setHeader("Authorization", `Bearer ${token}`);

  const variables = {
    id: projectId,
    input: updatedForm,
  }

  return makeGraphQLRequest(updateProjectMutation, variables);

}