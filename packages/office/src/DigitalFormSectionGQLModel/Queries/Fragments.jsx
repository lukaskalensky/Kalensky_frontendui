import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared"

const LinkFragmentStr = `
fragment Link on DigitalFormSectionGQLModel {
  __typename
  id
  lastchange
  created
  createdbyId
  changedbyId
  rbacobjectId
  name
  path
  label
  labelEn
  description
  sectionId
  formId
  order
  repeatableMin
  repeatableMax
  repeatable    
}

`

const MediumFragmentStr = `
fragment Medium on DigitalFormSectionGQLModel {
  ...Link
  rbacobject {
    ...RBRoles
  }
  createdby {
    __typename
    id
    fullname
    }

  changedby {
    __typename
    id
    fullname
    }
  form {
  __typename
    id
    name
    }
    section { __typename id name } 
}
`

const LargeFragmentStr = `
fragment Large on DigitalFormSectionGQLModel {
  ...Medium
  sections { ...Medium }
  fields {
  ...DigitalFormField
}
    form {
        __typename
        id
        name
        sections {
            ...Medium
        }
    }
}

fragment DigitalFormField on DigitalFormFieldGQLModel {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    createdby { __typename }
    changedby { __typename }
    rbacobject { __typename }
    name
    label
    labelEn
    description
    formSectionId
    formSection { __typename }
    formId
    form { __typename }
    required
    order
    computed
    formula
    typeId
    backendFormula
    flattenFormula
    }
`

const RoleFragmentStr = `
fragment Role on RoleGQLModel {
    __typename
    id
    lastchange
    created
    createdbyId
    changedbyId
    rbacobjectId
    createdby { id __typename }
    changedby { id __typename }
    rbacobject { id __typename }
    valid
    deputy
    startdate
    enddate
    roletypeId
    userId
    groupId
    roletype { __typename id }
    user { __typename id fullname }
    group { __typename id name }
  }
`

const RBACFragmentStr = `
fragment RBRoles on RBACObjectGQLModel {
  __typename
  id
  currentUserRoles {
    __typename
    id
    lastchange
    valid
    startdate
    enddate
    roletype {
      __typename
      id
      name
    }
    group {
      __typename
      id
      grouptype {
        __typename
        id
        name
      }
    }
  }
}`

export const RoleFragment = createQueryStrLazy(`${RoleFragmentStr}`)
export const RBACFragment = createQueryStrLazy(`${RBACFragmentStr}`)

export const LinkFragment = createQueryStrLazy(`${LinkFragmentStr}`)
export const MediumFragment = createQueryStrLazy(`${MediumFragmentStr}`, LinkFragment, RBACFragment)
export const LargeFragment = createQueryStrLazy(`${LargeFragmentStr}`, MediumFragment)
  