const id = (id : string) => {
    return cy.get(`[data-id='${id}']`)
}

beforeEach(() => {
    cy.request("DELETE", "http://www.speaknatively.net/api")
    cy.visit("http://www.speaknatively.net/admin")
    id("project_name").should("have.text", "speaknatively.net")
    id("branch_name").should("have.text", "www")
})

describe('Admin', () => {
    describe("root", () => {
        it('can create new files', () => {
            id("add_file_button").click();
            id("file_component_name").should("have.text", "File_0")
        })
        it('can create new folders', () => {
            id("add_folder_button").click();
            id("folder_component_name").should("have.text", "Folder_0")
        })
    })
    describe("file component", () => {
        it('can be renamed with button', () => {
            id("add_file_button").click();
            id("file_component_rename_button").click();
            id("rename_modal_save_button").should("be.disabled")
            id("rename_modal_name_input").type("My Component");
            id("rename_modal_save_button").click()
            id("file_component_name").should("have.text", "My Component")            
        })
        it('can be renamed with enter', () => {
            id("add_file_button").click();
            id("file_component_rename_button").click();   
            id("rename_modal_name_input").type("My Component{enter}");
            id("file_component_name").should("have.text", "My Component")            
        })
        it('can be removed with button', () => {
            id("add_file_button").click();
            id("file_component_remove_button").click();
            id("remove_modal_save_button").should("be.disabled")
            id("remove_modal_name_input").type("File_0");
            id("remove_modal_save_button").click()
            id("file_component_name").should("not.exist")
        })
        it('can be removed with enter', () => {
            id("add_file_button").click();
            id("file_component_remove_button").click();
            id("remove_modal_name_input").type("File_0{enter}");
            id("file_component_name").should("not.exist")
        })
        it("can be moved with button", () => {
            id("add_file_button").click();
            id("add_folder_button").click();
            id("file_component_move_button").click();
            id("move_modal_save_button").should("be.disabled")
            id("move_modal_parent_select").select("Folder_0")
            id("move_modal_save_button").click()
            id("folder_component_children").contains("File_0")

        })
    })
})