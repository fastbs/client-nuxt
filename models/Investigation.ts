import objectPath from "object-path";
import { toRaw } from "vue";
//import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import type { CreateInvestigationDto, InvestigationDto, ContentBlockDto } from "@/services/dto/investigations.dto";
import type { Node } from "@/services/dto/investigations.dto";
import type { EmployeeDto, ListEmployeeDto } from "@/services/dto/employees.dto"
import InvestigationsService from "@/services/InvestigationsService";
import EmployeesService from "@/services/EmployeesService";

export class Investigation {
    source: InvestigationDto = {
        _id: "",
        title: "",
        description: "",
        image: "",
        content: {},
        global_data: {},
        current_node: "",
        company: {
            name: "",
            name_short: "",
            inn: "",
        }
    };
    isReady = false;
    private _currentNode = "";
    private _currentComponent = "";
    private _currentBlock: ContentBlockDto = {
        _id: "",
        name: "",
        type: "",
        is_ready: false,
        data: {},
        children: {},
    };

    constructor() {
//        console.log("CONSTRUCTOR >>>>>")
//        console.log("   this.source:", this.source);
    }

    /*     async create(inv: CreateInvestigationDto, onDone: () => void, onError: (err: Error) => void) { // : Promise<boolean> {
            this.isReady = false;
    
            InvestigationsService.create(inv,
                result => {
                    this.source = structuredClone(result);
                    if (this.setCurrentNode(this.source.current_node)) {
                        this.isReady = true;
                        onDone();
                    } else {
                        const error = new Error;
                        error.message = "Wrong current node!";
                        onError(error);
                    }
                },
                error => {
                    onError(error);
                });
        } */

    load(_id: string, onDone: (result: InvestigationDto) => void, onError: (error: Error) => void) {
        InvestigationsService.get(_id,
            result => {
                this.source = structuredClone(result);
                console.log("this.source ", this.source)
                if (this.setCurrentNode(this.source.current_node)) {
                    this.isReady = true;
                    onDone(this.source);
                } else {
                    const error = new Error;
                    error.message = "Wrong current node!";
                    onError(error);
                }
            },
            error => {
                onError(error);
            });
    }

    save2(onDone: (result: InvestigationDto) => void, onError: (error: Error) => void) {
        if (this.isReady) {
            InvestigationsService.update2(this.source,
                result => {
                    onDone(result);
                },
                error => {
                    onError(error);
                });
        }
        else {
            const error = new Error;
            error.message = "Investigation not ready!";
            onError(error);
        }
    }

    async save(): Promise<boolean> {
        let result = false;
        try {
            if (this.isReady) {
                await InvestigationsService.update(this.source._id, this.source);
                result = true;
            } else {
                throw ("Investigation not ready!");
            }
        }
        catch (err) {
            console.error("Error in Investigation -> save: ", (err instanceof Error) ? err.message : "",);
        }
        return result;
    }

    get currentNode(): string {
        return this._currentNode;
    }

    get currentComponent(): string {
        return this._currentComponent;
    }

    get currentBlock(): ContentBlockDto {
        return this._currentBlock;
    }

    setCurrentNode(cn: string): boolean {
        let result = false;
        if (cn == "" || objectPath.has(this.source.content, cn)) {
            this._currentNode = cn;
            this.source.current_node = cn;
            this._currentComponent = objectPath.get(this.source.content, cn).type;
            this._currentBlock = structuredClone(toRaw(objectPath.get(this.source.content, cn)));
            //this._currentBlock = _.get(this.source.content, cn);  // _.cloneDeep(
            this._currentBlock ? delete this._currentBlock.children : {};
            result = true;
        }
        return result;
    }

    updateCurrentBlock(dc: object): void {
        this.currentBlock.data = dc;
        let path = "content";
        if (this._currentNode != "") {
            path = path + "." + this._currentNode;
        }
        path = path + ".data"
        objectPath.set(this.source, path, dc);
    }

    getNode(path: string): Node | boolean {
        let np = "";
        if (path == "") {
            np = "content";
        } else {
            np = "content." + path;
        }
        if (!objectPath.has(this.source, np)) {
            return false;
        } else {
            const pn = objectPath.get(this.source, np);
            const n: Node = { name: pn.name, path: path };
            return n;
        }
    }

    getParentNode(): Node | boolean {
        if (this._currentNode == "") {
            return false;
        } else {
            const pathParts = this._currentNode.split(".");
            pathParts.pop();
            pathParts.pop();
            const path = pathParts.join(".");
            const pn = this.getNode(path);
            return pn;
        }
    }

    getChildNodes(): Array<Node> | boolean {
        let path = "";
        if (this._currentNode == "") {
            path = "children";
        } else {
            path = this._currentNode + ".children";
        }
        if (!objectPath.has(this.source.content, path)) {
            return false;
        } else {
            const cns: Array<Node> = []; //Array<{ name: string, path: string }> = [];

            objectPath.get(this.source.content, path).forEach((item: ContentBlockDto, index: number) => {
                cns.push({ name: item.name, path: (path + "." + index) })
            });
            return cns;
        }
    }

    createNode(nodeType: string): boolean {
        const cns = this.getChildNodes();
        if (!cns) {
            const nn: ContentBlockDto = {
                _id: uuidv4(),
                type: nodeType,
                is_ready: false,
                name: "",
                data: {},
            };

            switch (nodeType) {
                case "FixationBlock":
                    nn.name = "Фиксация нарушения";
                    nn.data = {
                        submitter: {
                            employee_id: "",
                            position: "",
                        },
                        signers: [{}],
                        violators: [{}],
                    };
                    break;
                case "BossAcceptBlock":
                    nn.name = "Утверждение руководителем";
                    nn.data = {
                        counter: 3,
                    };
                    break;
                default:
                    break;
            }
            const path = this._currentNode ? this._currentNode + ".children" : "children";

            objectPath.set(this.source.content, path, [nn]);
        } else {
            console.log("children exists");
        }

        return true;
    }

    /*     // *** ШЛЯПА ??? ***
        async getEmployees(): Promise<Array<EmployeeDto> | null> {
            const query = await EmployeesService.fetch(<ListEmployeeDto>{ company: { _id: this.source.company._id } }); //this.source.company._id as string);
    
            query.onResult(queryResult => {
                if (queryResult.data) {
                    return <EmployeeDto[]>structuredClone(queryResult.data.employees);
                }
            });
    
            return null;
        } */
}

