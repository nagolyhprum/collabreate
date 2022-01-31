import { File } from '@prisma/client'
import { defaultAdminState } from '../../server/state'
import { test } from '../components'
import { 
    RenameModal, 
    FileComponent, 
    FolderComponent, 
    RemoveModal, 
    MoveModal
} from './'

describe("Components", () => {
    describe("RenameModal", () => {
        it("requires a name", () => {
            const global = defaultAdminState()
            const document = test(RenameModal, global, global)
            // it gets enabled
            document.input("rename_modal_name_input", "test")
            expect(document.id("rename_modal_save_button")?.enabled).toBe(true)
            // it gets disabled
            document.input("rename_modal_name_input", "")
            expect(document.id("rename_modal_save_button")?.enabled).toBe(false)
        })
        it("requires a unique name", () => {
            const global = defaultAdminState({
                modal : {
                    rename : {
                        id : 1,                        
                    }
                },
                files : [{
                    branchId : "",
                    id : -1,
                    isFolder : false,
                    name : "a",
                    parentId : -1,
                    uiId : ""
                }, {
                    branchId : "",
                    id : -1,
                    isFolder : true,
                    name : "b",
                    parentId : -1,
                    uiId : ""
                }]
            })
            const document = test(RenameModal, global, global)
            document.input("rename_modal_name_input", "a")
            expect(document.id("rename_modal_save_button")?.enabled).toBe(false)
            document.input("rename_modal_name_input", "b")
            expect(document.id("rename_modal_save_button")?.enabled).toBe(false)
            document.input("rename_modal_name_input", "c")
            expect(document.id("rename_modal_save_button")?.enabled).toBe(true)
        })
        it("can open and close", () => {
            const global = defaultAdminState({
                modal : {
                    rename : {
                        id : 1,                        
                    }
                }
            })
            const document = test(RenameModal, global, global)
            expect(document.id("rename_modal")?.visible).toBe(true)
            // lets cancel the rename
            document.click("rename_modal_cancel_button")
            expect(document.id("rename_modal")?.visible).toBe(false)
        })
        it("can rename a folder / file", () => {
            const global = defaultAdminState({
                modal : {
                    rename : {
                        id : 1,
                        input : "test 123",
                        name : "test"
                    }
                }
            })
            const fetch = jest.fn();
            const document = test(RenameModal, global, global, {
                fetch
            })
            // make sure it observes properly
            expect(document.id("rename_modal")?.visible).toBe(true)
            expect(document.id("rename_modal_title")?.text).toBe("Renaming: test")
            // save it
            document.click("rename_modal_save_button")
            expect(fetch).toBeCalledWith("/api/file", {
                method : "PATCH",
                headers : {
                    "Content-Type" : "application/json; charset=utf-8"
                },
                body : JSON.stringify({
                    id : 1,
                    name : "test 123"
                })
            })
            // it should close now
            expect(document.id("rename_modal")?.visible).toBe(false)
        })
    })
    describe("FileComponent", () => {
        const file = (file : Partial<File> = {}) => ({
            branchId : "",
            id : -1,
            isFolder : false,
            name : "",
            parentId : null,
            uiId : "",
            ...file
        })
        it("shows the files name", () => {
            const global = defaultAdminState()
            const local = file({
                name : "test"
            })
            const document = test(FileComponent, global, local)
            expect(document.id("file_component_name")?.text).toBe("test")
        })
        it("can open rename", () => {
            const global = defaultAdminState()
            const local = file({
                id : 1,
                name : "test"
            })
            const document = test(FileComponent, global, local)
            document.click("file_component_rename_buttom")
            expect(global.modal.rename).toEqual({
                id : 1,
                name : "test",
                input : "test"
            })
        })
        it("can open move", () => {
            const global = defaultAdminState()
            const local = file({
                id : 1,
                name : "test",
                parentId : 2
            })
            const document = test(FileComponent, global, local)
            document.click("file_component_move_buttom")
            expect(global.modal.move).toEqual({
                id : 1,
                name : "test",
                parentId : 2
            })
        })
        it("can open remove", () => {
            const global = defaultAdminState()
            const local = file({
                id : 1,
                name : "test"
            })
            const document = test(FileComponent, global, local)
            document.click("file_component_remove_buttom")
            expect(global.modal.remove).toEqual({
                id : 1,
                name : "test",
                input : ""
            })
        })
    })

    describe("FolderComponent", () => {
        const folder = (folder : Partial<File> = {}) => ({
            branchId : "",
            id : -1,
            isFolder : true,
            name : "",
            parentId : null,
            uiId : "",
            ...folder
        })
        it("shows the folders name", () => {
            const global = defaultAdminState()
            const local = folder({
                name : "test"
            })
            const document = test(FolderComponent, global, local)
            expect(document.id("folder_component_name")?.text).toBe("test")
        })
        it("can open rename", () => {
            const global = defaultAdminState()
            const local = folder({
                id : 1,
                name : "test"
            })
            const document = test(FolderComponent, global, local)
            document.click("folder_component_rename_button")
            expect(global.modal.rename).toEqual({
                id : 1,
                name : "test",
                input : "test"
            })
        })
        it("can open move", () => {
            const global = defaultAdminState()
            const local = folder({
                id : 1,
                name : "test",
                parentId : 2
            })
            const document = test(FolderComponent, global, local)
            document.click("folder_component_move_button")
            expect(global.modal.move).toEqual({
                id : 1,
                name : "test",
                parentId : 2
            })
        })
        it("can open remove", () => {
            const global = defaultAdminState()
            const local = folder({
                id : 1,
                name : "test"
            })
            const document = test(FolderComponent, global, local)
            document.click("folder_component_remove_button")
            expect(global.modal.remove).toEqual({
                id : 1,
                name : "test",
                input : ""
            })
        })
        it("can show/hide children", () => {
            const global = defaultAdminState({
                ui : {
                    "" : false
                }
            })
            const local = folder()
            const document = test(FolderComponent, global, local)
            expect(document.id("folder_component_children")?.visible).toBe(false)
            expect(document.id("folder_component_expand_collapse_text")?.text).toBe("+")
            document.click("folder_component_expand_collapse_button")
            expect(document.id("folder_component_children")?.visible).toBe(true)
            expect(document.id("folder_component_expand_collapse_text")?.text).toBe("-")
        })
        it("can add a new file", () => {
            const fetch = jest.fn();
            const global = defaultAdminState({
                ui : {
                    "" : false
                }
            })
            const local = folder()
            const document = test(FolderComponent, global, local, {
                fetch
            })
            expect(document.id("folder_component_children")?.visible).toBe(false)
            document.click("folder_component_add_file_button")
            expect(fetch).toBeCalledWith("/api/file", {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json; charset=utf-8"
                },
                body : JSON.stringify({
                    branchId : "",
                    isFolder : false,
                    parentId : -1,
                })
            })
            expect(document.id("folder_component_children")?.visible).toBe(true)
        })
        it("can add a new folder", () => {
            const fetch = jest.fn();
            const global = defaultAdminState({
                ui : {
                    "" : false
                }
            })
            const local = folder()
            const document = test(FolderComponent, global, local, {
                fetch
            })
            expect(document.id("folder_component_children")?.visible).toBe(false)
            document.click("folder_component_add_folder_button")
            expect(fetch).toBeCalledWith("/api/file", {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json; charset=utf-8"
                },
                body : JSON.stringify({
                    branchId : "",
                    isFolder : true,
                    parentId : -1,
                })
            })
            expect(document.id("folder_component_children")?.visible).toBe(true)
        })
    })
    describe("RemoveModal", () => {
        it("save enabled is properly tracked", () => {
            const global = defaultAdminState({
                modal : {
                    remove : {
                        id : 1,
                        input : "",
                        name : "test"
                    }
                }
            })
            const document = test(RemoveModal, global, global)
            expect(document.id("remove_modal_name_input")?.placeholder).toBe("test")
            // it gets disabled
            document.input("remove_modal_name_input", "")
            expect(document.id("remove_modal_save_button")?.enabled).toBe(false)
            // it stays disabled
            document.input("remove_modal_name_input", "te")
            expect(document.id("remove_modal_save_button")?.enabled).toBe(false)
            // it gets enabled
            document.input("remove_modal_name_input", "test")
            expect(document.id("remove_modal_save_button")?.enabled).toBe(true)
        })
        it("can open and close", () => {
            const global = defaultAdminState({
                modal : {
                    remove : {
                        id : 1,
                        input : "",
                        name : "test"
                    }
                }
            })
            const document = test(RemoveModal, global, global)
            expect(document.id("remove_modal")?.visible).toBe(true)
            document.click("remove_modal_cancel_button")
            expect(document.id("remove_modal")?.visible).toBe(false)
        })
        it("can remove a folder / file", () => {
            const global = defaultAdminState({
                modal : {
                    remove : {
                        id : 1,
                        input : "test",
                        name : "test"
                    }
                }
            })
            const fetch = jest.fn();
            const document = test(RemoveModal, global, global, {
                fetch
            })
            // make sure it observes properly
            expect(document.id("remove_modal")?.visible).toBe(true)
            // save it
            document.click("remove_modal_save_button")
            expect(fetch).toBeCalledWith("/api/file", {
                method : "DELETE",
                headers : {
                    "Content-Type" : "application/json; charset=utf-8"
                },
                body : JSON.stringify({
                    id : 1
                })
            })
            // it should close now
            expect(document.id("remove_modal")?.visible).toBe(false)
        })
    })
    describe("MoveModal", () => {
        it("opens and closes", () => {
            const global = defaultAdminState({
                modal : {
                    move : {
                        id : 1,
                        parentId : null,
                        name : "test"
                    }
                }
            })
            const document = test(MoveModal, global, global)
            expect(document.id("move_modal_title")?.text).toBe("Where would you like to move test")
            expect(document.id("move_modal")?.visible).toBe(true)
            document.click("move_modal_cancel_button")
            expect(document.id("move_modal")?.visible).toBe(false)
        })
        it("can update the parent", () => {
            const global = defaultAdminState()
            const document = test(MoveModal, global, global)
            document.select("move_modal_parent_select", "null")
            expect(global.modal.move.parentId).toBe(null)
            document.select("move_modal_parent_select", "1")
            expect(global.modal.move.parentId).toBe(1)
        })
        it("can save, which closes modal and expands folder", () => {
            const fetch = jest.fn()
            const global = defaultAdminState({
                files : [{
                    id : 2,
                    branchId : "",
                    isFolder : true,
                    name : "name",
                    parentId : null,
                    uiId : "uiId"
                }],
                modal : {
                    move : {
                        id : 1,
                        parentId : 2
                    }
                }
            })
            const document = test(MoveModal, global, global, {
                fetch
            })
            expect(global.ui.uiId).toBeFalsy()
            document.click("move_modal_save_button")
            expect(fetch).toBeCalledWith("/api/file", {
                method : "PATCH",
                headers : {
                    "Content-Type" : "application/json; charset=utf-8"
                },
                body : JSON.stringify({
                    id : 1,
                    parentId : 2
                })
            })
            expect(global.ui.uiId).toBe(true)
        })
    })
})