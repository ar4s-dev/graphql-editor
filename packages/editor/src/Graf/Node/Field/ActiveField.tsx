import React, { useState } from 'react';
import { TypeSystemDefinition, ValueDefinition } from 'graphql-js-tree';
import {
  NodeChangeFieldTypeMenu,
  NodeTypeOptionsMenu,
} from '@/shared/components/ContextMenu';
import { useTreesState } from '@/state/containers/trees';
import {
  DetailMenuItem,
  FieldPort,
  Menu,
  MenuScrollingArea,
  NodeFieldContainer,
} from '@/Graf/Node/components';
import { FieldProps } from '@/Graf/Node/models';
import styled from '@emotion/styled';
import { ActiveGrafFieldName } from '@/Graf/Node/Field/ActiveGrafFieldName';
import { ActiveGrafType } from '@/Graf/Node/Field/ActiveGrafType';
import { ArrowLeft } from '@/editor/icons';
import { transition } from '@/vars';
import { Arrq } from '@/shared/icons';

const OptionsMenuContainer = styled.div`
  position: fixed;
  z-index: 2;
  transform: translate(calc(50%), calc(50% + 21px));
`;

const TypeMenuContainer = styled.div`
  position: fixed;
  z-index: 2;
`;

export const ActiveField: React.FC<FieldProps> = ({
  node,
  inputOpen,
  inputDisabled,
  outputOpen,
  outputDisabled,
  onInputClick,
  onOutputClick,
  indexInParentNode,
  parentNode,
  isLocked,
  onDelete,
}) => {
  const { parentTypes, readonly, updateNode } = useTreesState();
  const [menuOpen, setMenuOpen] = useState<'options' | 'details' | 'type'>();
  const isEnumValue = node.data.type === ValueDefinition.EnumValueDefinition;

  return (
    <NodeFieldContainer
      className={`${inputOpen || menuOpen || outputOpen ? 'Active' : ''}`}
    >
      {node.data.type !== TypeSystemDefinition.UnionMemberDefinition && (
        <ActiveGrafFieldName
          afterChange={
            isLocked
              ? undefined
              : (newName) => {
                  node.name = newName;
                  updateNode(node);
                }
          }
          data={node.data}
          name={node.name}
          args={node.args}
          parentTypes={parentTypes}
        />
      )}
      {!isEnumValue && (
        <ActiveGrafType
          onClick={
            !readonly
              ? () => setMenuOpen(menuOpen === 'type' ? undefined : 'type')
              : undefined
          }
          type={node.type}
          parentTypes={parentTypes}
        >
          {menuOpen === 'type' && (
            <TypeMenuContainer>
              <NodeChangeFieldTypeMenu
                node={parentNode}
                fieldIndex={indexInParentNode}
                hideMenu={() => {
                  setMenuOpen(undefined);
                }}
              />
            </TypeMenuContainer>
          )}
        </ActiveGrafType>
      )}
      {!isLocked &&
        !isEnumValue &&
        node.data.type !== TypeSystemDefinition.UnionMemberDefinition && (
          <RequiredTypes
            className="node-field-port"
            opened={menuOpen === 'options'}
            onClick={() => {
              setMenuOpen(menuOpen === 'options' ? undefined : 'options');
            }}
          >
            <Arrq width={12} />
            {menuOpen === 'options' && (
              <OptionsMenuContainer>
                <NodeTypeOptionsMenu
                  hideMenu={() => {
                    setMenuOpen(undefined);
                  }}
                  node={node}
                />
              </OptionsMenuContainer>
            )}
          </RequiredTypes>
        )}
      <Actions>
        {!inputDisabled &&
          node.data.type !== TypeSystemDefinition.UnionMemberDefinition && (
            <FieldPort
              onClick={onInputClick}
              open={inputOpen}
              info={{
                message: 'Field arguments and directives',
                placement: 'left',
              }}
            />
          )}
        {!isLocked && (
          <FieldPort
            icons={{ closed: 'More', open: 'More' }}
            onClick={() => {
              setMenuOpen(menuOpen === 'details' ? undefined : 'details');
            }}
          >
            {menuOpen === 'details' && (
              <OptionsMenuContainer>
                <Menu
                  menuName={'Node options'}
                  hideMenu={() => setMenuOpen(undefined)}
                >
                  <MenuScrollingArea>
                    <DetailMenuItem onClick={onDelete}>Delete</DetailMenuItem>
                  </MenuScrollingArea>
                </Menu>
              </OptionsMenuContainer>
            )}
          </FieldPort>
        )}
      </Actions>
      <OuterActions>
        {!outputDisabled && (
          <OutputArrow
            className="node-field-port"
            onClick={onOutputClick}
            // info={{
            //   message: `Expand ${getTypeName(node.type.fieldType)} details`,
            //   placement: 'right',
            // }}
            opened={outputOpen}
          >
            <ArrowLeft size={12} />
          </OutputArrow>
        )}
      </OuterActions>
    </NodeFieldContainer>
  );
};

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  position: absolute;
  width: 100%;
  left: 0;
  right: 0;
  transform: translateY(-100%);
  pointer-events: none;
  z-index: 2;
`;

const OuterActions = styled.div`
  display: flex;
  position: absolute;
  right: 0;
  transform: translateX(100%);
  pointer-events: none;
  z-index: 2;
`;

const RequiredTypes = styled.div<{ opened?: boolean }>`
  pointer-events: all;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  svg {
    fill: ${({ theme, opened }) => (opened ? theme.active : theme.text)};
    transition: ${transition};
  }
`;

const OutputArrow = styled.div<{ opened?: boolean }>`
  pointer-events: all;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  svg {
    fill: ${({ theme }) => theme.text};
    rotate: ${({ opened }) => (opened ? '270deg' : '180deg')};
    transition: ${transition};
  }
`;
