import { code, execute } from '../../../language'
import { defaultAdminState } from '../../../server/state'
import { WRAP } from '../../components'
import { RenameModal } from './'

const test = <Global extends GlobalState, Local>(
    component : ComponentFromConfig<Global, Local>,
    global : Global,
    local : Local
) => {
    const root = component({
        global,
        local,
        parent : {
            height : WRAP,
            width : WRAP,
            name : "root",            
        }
    })
    const update = (document = root) => {
        (document.observe ?? []).forEach((callback) => {
            const generated = code(callback, new Set([]))
            execute(generated, {
                event : document,
                global,
                index : -1,
                local,                    
            })
        });
        (document.children ?? []).forEach(update);
    }
    update()
    return {
        input(id : string, event : string) {
            const component = this.id(id);
            (component?.onInput ?? []).forEach(callback => {
                const generated = code(callback, new Set([]))
                execute(generated, {
                    event,
                    global,
                    index : -1,
                    local,                    
                })
            })
            update()
        },
        id(id : string, document = root) : Component<Global, Local> | null {
            if(document.id === id) {
                return document;
            } else {
                return (document.children ?? []).reduce((match, child) => match || this.id(id, child), null as (Component<Global, Local> | null))
            }
        }
    }
}

describe("Components", () => {
    describe("RenameModal", () => {
        it("does not allow empty names", () => {
            const state = defaultAdminState()
            const document = test(RenameModal, state, state)
            // it gets enabled
            const value = "test"
            document.input("rename_modal_name_input", value)
            expect(state.modal.rename.input).toBe(value)
            expect(document.id("rename_modal_save_button")?.enabled).toBe(true)
            // it gets disabled
            document.input("rename_modal_name_input", "")
            expect(state.modal.rename.input).toBe("")
            expect(document.id("rename_modal_save_button")?.enabled).toBe(false)
        })
    })
})