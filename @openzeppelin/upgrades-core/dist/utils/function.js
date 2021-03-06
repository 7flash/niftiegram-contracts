"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionSignature = void 0;
const assert_1 = require("./assert");
function serializeTypeName(parameter, deref) {
    const { typeName, storageLocation } = parameter;
    assert_1.assert(!!typeName);
    if (storageLocation === 'storage') {
        assert_1.assert(typeof typeName.typeDescriptions.typeString === 'string');
        return typeName.typeDescriptions.typeString.replace(/^struct /, '') + ' storage';
    }
    switch (typeName.nodeType) {
        case 'ArrayTypeName':
        case 'ElementaryTypeName': {
            assert_1.assert(typeof typeName.typeDescriptions.typeString === 'string');
            return typeName.typeDescriptions.typeString;
        }
        case 'UserDefinedTypeName': {
            const userDefinedType = deref(['StructDefinition', 'EnumDefinition', 'ContractDefinition'], typeName.referencedDeclaration);
            switch (userDefinedType.nodeType) {
                case 'StructDefinition':
                    return '(' + userDefinedType.members.map(member => serializeTypeName(member, deref)) + ')';
                case 'EnumDefinition':
                    assert_1.assert(userDefinedType.members.length < 256);
                    return 'uint8';
                case 'ContractDefinition':
                    return 'address';
                default:
                    return assert_1.assertUnreachable(userDefinedType);
            }
        }
        default:
            throw new Error(`Unsuported TypeName node type: ${typeName.nodeType}`);
    }
}
function getFunctionSignature(fnDef, deref) {
    return `${fnDef.name}(${fnDef.parameters.parameters.map(parameter => serializeTypeName(parameter, deref)).join()})`;
}
exports.getFunctionSignature = getFunctionSignature;
//# sourceMappingURL=function.js.map