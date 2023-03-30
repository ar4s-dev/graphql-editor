import { useRelationsState, useTreesState } from '@/state/containers';
import { ParserField, TypeDefinition, getTypeName } from 'graphql-js-tree';
import React, { useMemo } from 'react';
import { Field } from '../Field';
import { FIELD_NAME_SIZE } from '@/Graf/constants';
import { fontFamilySans, transition } from '@/vars';
import styled from '@emotion/styled';
import { EditorTheme } from '@/gshared/theme/MainTheme';
import { ActiveType } from '@/Relation/Field/ActiveType';
import { PenLine } from '@aexol-studio/styling-system';

type NodeTypes = keyof EditorTheme['colors'];

interface ContentProps {
  nodeType: NodeTypes;
  isSelected?: boolean;
  isRelated?: boolean;
  isLibrary?: boolean;
  readOnly?: boolean;
}

const Content = styled.div<ContentProps>`
  background-color: ${({ theme }) => `${theme.neutral[600]}`};
  padding: 12px;
  position: relative;
  text-rendering: optimizeSpeed;
  border-radius: ${(p) => p.theme.radius}px;
  margin: 15px;
  transition: 0.25s all ease-in-out;
  z-index: 1;
  flex: 1 0 auto;
  font-family: ${fontFamilySans};
  font-size: 14px;
  max-width: 66vw;
  opacity: ${({ isRelated }) => (isRelated ? 1.0 : 0.5)};
  cursor: ${({ isSelected }) => (isSelected ? 'auto' : 'pointer')};
  border-width: 1px;
  border-style: ${({ isLibrary }) => (isLibrary ? 'dashed' : 'solid')};
  border-color: ${({ theme, nodeType, isSelected }) =>
    theme.colors[nodeType] && isSelected
      ? theme.colors[nodeType]
      : `${theme.dividerMain}88`};
  &:hover {
    border-color: ${({ theme, nodeType }) =>
      theme.colors[nodeType]
        ? theme.colors[nodeType]
        : `${theme.accents[100]}00`};
  }
`;

const NodeRelationFields = styled.div``;

const NodeTitle = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text.active};
  font-size: 14px;
  font-weight: 500;
  height: 40px;
  position: relative;
  padding-right: 1.5rem;
  display: flex;
`;
const EditNodeContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  background-color: ${(p) => p.theme.neutral[400]};
  color: ${(p) => p.theme.button.standalone.active};
  border-top-right-radius: ${(p) => p.theme.radius}px;
  border-bottom-left-radius: ${(p) => p.theme.radius}px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${transition};
  pointer-events: all;
  cursor: pointer;
  z-index: 1;
  :hover {
    background-color: ${(p) => p.theme.neutral[200]};
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const NameInRelation = styled.span`
  margin-right: 5px;
  color: ${({ theme }) => theme.text.active};
  padding: 0;
  font-family: ${fontFamilySans};
  font-size: ${FIELD_NAME_SIZE};
`;

interface NodeProps {
  field: ParserField;
  isLibrary?: boolean;
  setRef: (instance: HTMLDivElement) => void;
  canSelect?: boolean;
}

export const Node: React.FC<NodeProps> = ({
  field,
  setRef,
  isLibrary,
  canSelect,
}) => {
  const { setSelectedNodeId, activeNode, relatedToSelected } = useTreesState();
  const { setEditMode } = useRelationsState();
  const isSelected = !!activeNode && field.id === activeNode.id;
  const RelationFields = useMemo(() => {
    return (
      <NodeRelationFields>
        {field.args.map((a, i) => (
          <Field
            active={
              isSelected &&
              field.data.type !== TypeDefinition.EnumTypeDefinition
            }
            key={a.name}
            node={a}
          />
        ))}
      </NodeRelationFields>
    );
  }, [JSON.stringify(field), isSelected]);

  const NodeContent = useMemo(
    () => (
      <ContentWrapper>
        <NodeTitle>
          <NameInRelation>{field.name}</NameInRelation>
          <ActiveType type={field.type} />
        </NodeTitle>
      </ContentWrapper>
    ),
    [field],
  );

  return (
    <Content
      isRelated={
        activeNode
          ? relatedToSelected?.includes(field.name) || isSelected
          : true
      }
      isSelected={isSelected}
      isLibrary={isLibrary}
      nodeType={getTypeName(field.type.fieldType) as NodeTypes}
      ref={(ref) => {
        if (ref) {
          setRef(ref);
        }
      }}
      onClick={(e) => {
        if (!canSelect || isSelected) return;
        e.stopPropagation();
        setSelectedNodeId({
          value: {
            id: field.id,
            name: field.name,
          },
          source: 'relation',
        });
      }}
    >
      {isSelected && (
        <EditNodeContainer
          onClick={(e) => {
            e.stopPropagation();
            setEditMode(field.id);
          }}
        >
          <PenLine width={16} height={16} />
        </EditNodeContainer>
      )}
      {NodeContent}
      {RelationFields}
    </Content>
  );
};
